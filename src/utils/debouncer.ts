type IProps = {
  debouncer: () => void;
  debounceTimeout: number;
};
let timer: any;

export const debounce = (
  // p0: (value: string) => void,
  // p1: number,
  { debouncer, debounceTimeout = 1000 }: IProps,
) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    debouncer();
  }, debounceTimeout);
};

export const debouncer = <T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const result = await func(...args);
        resolve(result);
      }, wait);
    });
  };
};
