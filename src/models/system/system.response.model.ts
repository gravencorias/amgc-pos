// One of the server PC's addresses on the store's network.
export interface IServerAddressResponse {
  address: string;
  // The network adapter's name in Windows, e.g. "Wi-Fi" or "Ethernet".
  adapterName: string;
  // What a tablet's browser opens, e.g. "http://192.168.1.10:5000".
  url: string;
}

export interface IServerInfoResponse {
  port: number;
  addresses: IServerAddressResponse[];
}
