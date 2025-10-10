import util from "util";

export const pretty = (item: unknown) =>
  util.inspect(item, { showHidden: false, depth: null, colors: true });
