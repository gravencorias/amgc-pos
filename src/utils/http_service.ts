import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import Swal from "sweetalert2";
import { useAuthStore } from "../stores/common/auth.store";
import { useConnectionStore } from "../stores/common/connection.store";

export const Toast = Swal.mixin({
  toast: true,
  position: "top-right",
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export const showPopConfirmation = ({
  title,
  text,
  confirmButtonText = "Confirm",
}: {
  title: string;
  text?: string;
  confirmButtonText?: string;
}) =>
  Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    confirmButtonColor: "#896790",
    cancelButtonText: "Cancel",
  });

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

axios.interceptors.request.use(
  (config) => {
    const token = window.localStorage.getItem("hr_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    config.headers["X-Referrer"] = window.location.href;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// WHY A SESSION ENDED, handed from the 401 handling below to the Unauthorized
// page. sessionStorage rather than a store: the user may refresh on the
// unauthorized page, and the token it is worked out from is cleared first.
export const SESSION_END_KEY = "hr-payroll-session-end";
export type SessionEndReason = "expired" | "rejected" | "signed-out";

const isTokenExpired = (token: string) => {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    return typeof exp === "number" && exp * 1000 < Date.now();
  } catch {
    return false;
  }
};

// Call BEFORE clearing the token - the reason is worked out from it.
export const recordSessionEnd = () => {
  const token = window.localStorage.getItem("hr_token");
  const hasToken = !!token && token !== "null";
  const reason: SessionEndReason = !hasToken
    ? "signed-out"
    : isTokenExpired(token)
      ? "expired"
      : "rejected";
  try {
    window.sessionStorage.setItem(SESSION_END_KEY, reason);
  } catch {
    // Storage blocked: the page falls back to its general message.
  }
};

// A request that got NO response - not a 4xx/5xx, which is the server
// answering - means the API is out of reach. A request the app cancelled
// itself says nothing about the network.
const isNetworkFailure = (error: AxiosError) =>
  !error.response && error.code !== "ERR_CANCELED";

// The gateway's or server's "not now" for the whole service - 502/504 when a
// system behind the API failed, 503 for maintenance or overload. Every other
// status (a 400, a 404, an ordinary 500) is about the one request, and is left
// to the screen that made it.
export const serviceDownStatus = (status: number | undefined) =>
  status === 503 ? 503 : status === 502 || status === 504 ? 502 : null;

axios.interceptors.response.use(
  (response) => {
    useConnectionStore.getState().markReachable();
    return response;
  },
  (error) => {
    const { setToken, setIsAuthenticated } = useAuthStore.getState();
    const { markReachable, markUnreachable, markServiceDown } =
      useConnectionStore.getState();

    // Feeds the offline screen (common/status/OfflineScreen.tsx).
    const down = serviceDownStatus(error?.response?.status);
    if (isNetworkFailure(error)) markUnreachable();
    else if (down) markServiceDown(down);
    else if (error?.response) markReachable();

    if (
      error?.response?.status === 401 ||
      error?.response?.data?.message?.toLocaleLowerCase() ===
        "Oops, you are not authorize to access this resource".toLocaleLowerCase()
    ) {
      Toast.fire({
        icon: "error",
        title: error?.message
          ? error?.message
          : error?.response?.data?.message
            ? error?.response?.data?.message
            : "Contact the developers for more info",
      });
      recordSessionEnd();
      setToken(null);
      setIsAuthenticated(false);
    }
    // console.log("ERROR--service: ", error);
    return Promise.reject(error);
  },
);

const sleep = (ms: number) => (response: AxiosResponse) =>
  new Promise<AxiosResponse>((resolve) =>
    setTimeout(() => resolve(response), ms),
  );

const responseBody = (response: AxiosResponse) => response.data;

const production = {
  get: (url: string, config?: AxiosRequestConfig | undefined) =>
    axios.get(url, config).then(responseBody),
  post: (url: string, body: {}, config?: AxiosRequestConfig | undefined) =>
    axios.post(url, body, config).then(sleep(1000)).then(responseBody),
  put: (url: string, body?: {}, config?: AxiosRequestConfig | undefined) =>
    axios.put(url, body, config).then(sleep(1000)).then(responseBody),
  patch: (url: string, body?: {}, config?: AxiosRequestConfig | undefined) =>
    axios.patch(url, body, config).then(sleep(1000)).then(responseBody),
  delete: (url: string, config?: AxiosRequestConfig | undefined) =>
    axios.delete(url, config).then(responseBody),
  postForm: (
    url: string,
    file: Blob,
    fields?: Record<string, string | number>,
  ) => {
    let formData = new FormData();
    formData.append("File", file);
    if (fields) {
      Object.entries(fields).forEach(([key, value]) =>
        formData.append(key, String(value)),
      );
    }
    return axios
      .post(url, formData, {
        headers: {
          "Content-type": "multipart/form-data",
        },
      })
      .then(responseBody);
  },
};

const development = {
  get: (url: string, config?: AxiosRequestConfig | undefined) =>
    axios.get(url, config).then(sleep(1000)).then(responseBody),
  post: (url: string, body: {}, config?: AxiosRequestConfig | undefined) =>
    axios.post(url, body, config).then(sleep(1000)).then(responseBody),
  put: (url: string, body?: {}, config?: AxiosRequestConfig | undefined) =>
    axios.put(url, body, config).then(sleep(1000)).then(responseBody),
  patch: (url: string, body?: {}, config?: AxiosRequestConfig | undefined) =>
    axios.patch(url, body, config).then(sleep(1000)).then(responseBody),
  delete: (url: string, config?: AxiosRequestConfig | undefined) =>
    axios.delete(url, config).then(sleep(1000)).then(responseBody),
  postForm: (
    url: string,
    file: Blob,
    fields?: Record<string, string | number>,
  ) => {
    let formData = new FormData();
    formData.append("File", file);
    if (fields) {
      Object.entries(fields).forEach(([key, value]) =>
        formData.append(key, String(value)),
      );
    }
    return axios
      .post(url, formData, {
        headers: {
          "Content-type": "multipart/form-data",
        },
      })
      .then(sleep(1000))
      .then(responseBody);
  },
};

const requests =
  import.meta.env.MODE === "development" ? development : production;

export default requests;
