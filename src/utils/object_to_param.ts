export const getKeyValue =
  <U extends keyof T, T extends object>(key: U) =>
  (obj: T) =>
    obj[key];

export class ObjectDeserializer {
  ObjectToParams = <T extends object>(props: T): string => {
    let response = [] as any;

    Object.keys(props).map((x: string) => {
      const data = getKeyValue<keyof any, any>(x)(props);
      if (typeof data === "object") {
        if (data)
          data.map((dataArrayItem: any) => {
            if (dataArrayItem) response.push(`${x}=${dataArrayItem}`);
          });
      } else {
        if (data || data === 0) response.push(`${x}=${data}`);
      }
    });
    return response.join("&");
  };
}
