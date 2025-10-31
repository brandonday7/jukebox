import ColorHash from "color-hash";

const colorHash = new ColorHash({
  saturation: [0.25, 0.35, 0.45], // Very muted
  lightness: [0.5, 0.6, 0.7], // Lighter/softer
});

export default colorHash;

export const toHSLA = (h: number, s: number, l: number, a: number) =>
  `hsla(${h}, ${s * 100}%, ${l * 100}%, ${a})`;
