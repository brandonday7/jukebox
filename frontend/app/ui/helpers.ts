export const toHSLA = (h: number, s: number, l: number, a: number) =>
  `hsla(${h}, ${s * 100}%, ${l * 100}%, ${a})`;
