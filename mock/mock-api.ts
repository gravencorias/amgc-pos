/**
 * DEV-ONLY MOCK OF amgc-pos-api.
 *
 * Runs inside `yarn dev` (vite.config.ts) when VITE_USE_MOCK_API=true, answering
 * the routes in docs/api-contract.md so the app works before the real ASP.NET
 * Core API exists. It is never part of a build. Data is kept in mock/data/db.json
 * (git-ignored); delete that file to start over.
 *
 * Demo sign-ins (mock only): see README.md.
 */
import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, resolve } from "node:path";

type Role = { code: string; value: string };
type User = { id: number; username: string | null; password: string | null; pin: string | null; fullName: string; role: Role };

const ROLES = {
  owner: { code: "P001", value: "Owner" },
  manager: { code: "P002", value: "Manager" },
  cashier: { code: "P003", value: "Cashier" },
};

const USERS: User[] = [
  { id: 1, username: "owner", password: "owner1234", pin: null, fullName: "Maria Santos", role: ROLES.owner },
  { id: 2, username: "manager", password: "manager1234", pin: null, fullName: "Jose Reyes", role: ROLES.manager },
  { id: 3, username: null, password: null, pin: "1234", fullName: "Ana Cruz", role: ROLES.cashier },
  { id: 4, username: null, password: null, pin: "5678", fullName: "Ben Dizon", role: ROLES.cashier },
];

const DEFAULT_SETTINGS = {
  storeName: "My Café",
  tagline: "",
  address: "",
  tin: "",
  vatRegistered: true,
  receiptFooter: "Salamat po! Come again.",
  showLogoOnReceipt: true,
  logoUrl: null as string | null,
  theme: "ube",
  customColor: "#0D6C77",
  mode: "light",
  corners: "soft",
  textSize: "normal",
  updatedAt: new Date().toISOString(),
};
type Settings = typeof DEFAULT_SETTINGS;

const DB_FILE = resolve(process.cwd(), "mock/data/db.json");
const tokens = new Map<string, number>();

const loadSettings = (): Settings => {
  try {
    if (existsSync(DB_FILE)) return { ...DEFAULT_SETTINGS, ...JSON.parse(readFileSync(DB_FILE, "utf8")).settings };
  } catch {
    // Unreadable file: start from the defaults.
  }
  return { ...DEFAULT_SETTINGS };
};
let settings = loadSettings();
const saveSettings = () => {
  mkdirSync(dirname(DB_FILE), { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify({ settings }, null, 2));
};

const readBody = (req: IncomingMessage) =>
  new Promise<Buffer>((done, fail) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => done(Buffer.concat(chunks)));
    req.on("error", fail);
  });

const send = (res: ServerResponse, status: number, body?: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(body === undefined ? "" : JSON.stringify(body));
};

// Just enough multipart parsing for the single "File" part the app sends.
const readFilePart = (body: Buffer, contentType: string) => {
  const boundary = /boundary=(.+)$/.exec(contentType)?.[1];
  if (!boundary) return null;
  const marker = Buffer.from(`--${boundary}`);
  let start = body.indexOf(marker);
  while (start !== -1) {
    const next = body.indexOf(marker, start + marker.length);
    if (next === -1) break;
    const part = body.subarray(start + marker.length + 2, next - 2);
    const headerEnd = part.indexOf("\r\n\r\n");
    const headers = part.subarray(0, headerEnd).toString();
    if (/name="File"/.test(headers)) {
      const type = /Content-Type:\s*([^\r\n]+)/i.exec(headers)?.[1] ?? "application/octet-stream";
      return { type, data: part.subarray(headerEnd + 4) };
    }
    start = next;
  }
  return null;
};

const account = (user: User, token: string) => ({
  id: user.id,
  userInfo: { id: user.id, username: user.username, fullName: user.fullName, roleName: user.role.value },
  tokenInfo: {
    token,
    refreshToken: "",
    expiration: Date.now() + 12 * 3600e3,
    roles: [{ access: user.role.value }],
    accessLevels: [user.role],
  },
});

const signIn = (user: User) => {
  const token = randomBytes(24).toString("hex");
  tokens.set(token, user.id);
  return account(user, token);
};

const publicSettings = () => ({
  storeName: settings.storeName,
  logoUrl: settings.logoUrl,
  theme: settings.theme,
  customColor: settings.customColor,
  mode: settings.mode,
  corners: settings.corners,
  textSize: settings.textSize,
});

export const mockApi = (): Plugin => ({
  name: "amgc-mock-api",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/api", async (req, res) => {
      try {
        const path = (req.url ?? "/").split("?")[0].replace(/\/+$/, "") || "/";
        const method = req.method ?? "GET";
        const raw = await readBody(req);
        const json = () => (raw.length ? JSON.parse(raw.toString()) : {});

        // Public routes
        if (method === "GET" && path === "/store-settings/public") return send(res, 200, publicSettings());

        if (method === "POST" && path === "/auth/login") {
          const { username, password } = json();
          const user = USERS.find((u) => u.username && u.username === String(username ?? "").trim().toLowerCase());
          // 400, not 401: http_service treats a 401 as "session ended".
          if (!user || user.password !== password) return send(res, 400, { message: "The username or password is incorrect." });
          return send(res, 200, signIn(user));
        }

        if (method === "POST" && path === "/auth/pin") {
          const { pin } = json();
          const user = USERS.find((u) => u.pin && u.pin === String(pin ?? ""));
          if (!user) return send(res, 400, { message: "That PIN doesn't match a cashier." });
          return send(res, 200, signIn(user));
        }

        // Signed-in routes
        const token = /^Bearer (.+)$/.exec(String(req.headers.authorization ?? ""))?.[1];
        const userId = token ? tokens.get(token) : undefined;
        const user = USERS.find((u) => u.id === userId);
        if (!user || !token) return send(res, 401, { message: "Oops, you are not authorize to access this resource" });
        const isManager = user.role.code !== ROLES.cashier.code;

        if (method === "GET" && path === "/account/me") return send(res, 200, account(user, token));

        if (method === "GET" && path === "/store-settings") return send(res, 200, settings);

        if (path.startsWith("/store-settings") && !isManager)
          return send(res, 403, { message: "Only an owner or manager can change store settings." });

        if (method === "PUT" && path === "/store-settings/update") {
          const body = json();
          if (!String(body.storeName ?? "").trim()) return send(res, 400, { message: "Store name is required." });
          settings = { ...settings, ...body, logoUrl: settings.logoUrl, updatedAt: new Date().toISOString() };
          saveSettings();
          return send(res, 200, settings);
        }

        if (method === "POST" && path === "/store-settings/logo") {
          const file = readFilePart(raw, String(req.headers["content-type"] ?? ""));
          if (!file || !file.data.length) return send(res, 400, { message: "Choose an image file to upload." });
          if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return send(res, 400, { message: "Use a PNG, JPG or WebP image." });
          // The real API stores the file and returns its URL; the mock keeps a data URL.
          settings = { ...settings, logoUrl: `data:${file.type};base64,${file.data.toString("base64")}`, updatedAt: new Date().toISOString() };
          saveSettings();
          return send(res, 200, settings);
        }

        if (method === "DELETE" && path === "/store-settings/logo") {
          settings = { ...settings, logoUrl: null, updatedAt: new Date().toISOString() };
          saveSettings();
          return send(res, 200, settings);
        }

        return send(res, 404, { message: `No mock for ${method} ${path}.` });
      } catch (error) {
        return send(res, 500, { message: error instanceof Error ? error.message : "Mock API error." });
      }
    });
  },
});
