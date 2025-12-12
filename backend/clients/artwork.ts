// This file is still WIP while hardware is getting up and running.

import { Jimp, type Bitmap } from "jimp";
import terminalImage from "terminal-image";

export const generateArtworkFileFromUrl = async (url: string, size = 80) => {
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

    rgb565Array.push((rgb565 >> 8) & 0xff);
    rgb565Array.push(rgb565 & 0xff);
  }

  // Convert RGB565 back to RGBA for display
  const displayData = new Uint8ClampedArray(bitmap.width * bitmap.height * 4);

  for (let i = 0, j = 0; i < rgb565Array.length; i += 2, j += 4) {
    const highByte = rgb565Array[i];
    const lowByte = rgb565Array[i + 1];
    const rgb565 = (highByte << 8) | lowByte;

    const r5 = (rgb565 >> 11) & 0x1f;
    const g6 = (rgb565 >> 5) & 0x3f;
    const b5 = rgb565 & 0x1f;

    displayData[j] = (r5 << 3) | (r5 >> 2);
    displayData[j + 1] = (g6 << 2) | (g6 >> 4);
    displayData[j + 2] = (b5 << 3) | (b5 >> 2);
    displayData[j + 3] = 255;
  }

  // Create new Jimp image from the converted data
  const image = new Jimp({
    data: Buffer.from(displayData),
    width: bitmap.width,
    height: bitmap.height,
  });
  const buffer = await image.getBuffer("image/png");

  console.log(await terminalImage.buffer(buffer));

  return rgb565Array;
};
