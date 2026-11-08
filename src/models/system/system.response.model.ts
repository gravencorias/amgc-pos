// One of the server PC's addresses on the store's network.
export interface IServerAddressResponse {
  address: string;
  // The network adapter's name in Windows, e.g. "Wi-Fi" or "Ethernet".
  adapterName: string;
  // What a tablet's browser opens, e.g. "http://192.168.1.10:5000".
  url: string;
}

// GET system/version (public). The Android app compares it with its own APP_VERSION.
export interface IVersionResponse {
  // The installed package's version, e.g. "1.1.0"; "dev" when the API runs in Development.
  version: string;
  // Where the matching Android app downloads from on this server ("/downloads/AMGC-POS.apk"),
  // or null when the package has no APK.
  androidAppPath: string | null;
}

export interface IServerInfoResponse extends IVersionResponse {
  port: number;
  addresses: IServerAddressResponse[];
}
