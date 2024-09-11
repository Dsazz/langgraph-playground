import fs from "fs";
import path from "path";
import { ROOT_DIR } from "@constants/path.constant";

const IMAGE_DIR = path.join(ROOT_DIR, "images");
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)$/;

/**
 * Get list of images in the images directory
 * @param nestedDir - Nested directory to search for images
 * @returns List of images in the directory
 */
const getImageList = (nestedDir?: string): string[] => {
  const imageDir = nestedDir ? path.join(IMAGE_DIR, nestedDir) : IMAGE_DIR;
  try {
    return fs
      .readdirSync(imageDir)
      .filter((file) => IMAGE_EXTENSIONS.test(file));
  } catch (err) {
    console.error(`Error reading directory: ${(err as Error).message}`);
    return [];
  }
};
export default getImageList;
