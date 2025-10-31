import ColorHash from "color-hash";

const colorHash = new ColorHash({
  saturation: [0.25, 0.35, 0.45], // Very muted
  lightness: [0.5, 0.6, 0.7], // Lighter/softer
});

export default colorHash;

export const toHSLA = (h: number, s: number, l: number, a: number) =>
  `hsla(${h}, ${s * 100}%, ${l * 100}%, ${a})`;

export const lighter = (
  h: number,
  s: number,
  l: number,
  percentage: number
) => {
  if (percentage < 0 || percentage > 1) {
    throw new Error("lighter: percentage must be a value between 0 and 1");
  } else {
    return `hsl(${h}, ${s * 100}%, ${Math.min(1, l + percentage) * 100}%)`;
  }
};
