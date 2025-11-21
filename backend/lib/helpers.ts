import util from "util";

export const pretty = (item: unknown) =>
  util.inspect(item, { showHidden: false, depth: null, colors: true });

export const isDefined = (value: unknown) => {
  if (value === null || value === undefined) {
    return false;
  }
  return true;
};

export const logError = (error: Error) => console.warn(pretty(error));

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
