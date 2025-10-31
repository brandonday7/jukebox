import ColorHash from "color-hash";

const colorHash = new ColorHash();

export default colorHash;

export const toHSLA = (h: number, s: number, l: number, a: number) =>
  `hsla(${h}, ${s * 100}%, ${l * 100}%, ${a})`;
