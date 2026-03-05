import { Jimp, type Bitmap } from "jimp";

export const generateArtworkFileFromUrl = async (url: string, size = 10) => {
  const image = await Jimp.read(url);
  image.resize({ w: size, h: size });
  return image;
};

export const fileAsPixelArray = async (bitmap: Bitmap) => {
  const rgb565Array = [];

  for (let i = 0; i < bitmap.data.length; i += 4) {
    const r = bitmap.data[i];
    const g = bitmap.data[i + 1];
    const b = bitmap.data[i + 2];

    const r5 = (r >> 3) & 0x1f;
    const g6 = (g >> 2) & 0x3f;
    const b5 = (b >> 3) & 0x1f;

    const rgb565 = (r5 << 11) | (g6 << 5) | b5;
    rgb565Array.push(rgb565);
  }

  return rgb565Array;
};
