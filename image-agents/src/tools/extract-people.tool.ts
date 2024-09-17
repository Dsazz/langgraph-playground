import axios, { AxiosError } from "axios";
import process from "node:process";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs";
import FormData from "form-data";
import path from "node:path";
import { ROOT_DIR } from "@constants/path.constant.js";
import { logger } from "@utils/colored-log.util.js";

async function toolsServiceHandler(imagePath: string): Promise<string> {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const formData = new FormData();
    formData.append("file", imageBuffer, { filename: "image.jpg" });

    const response = await axios.post(
      `${process.env.TOOLS_SERVICE_URL}/extract-people`,
      formData,
      {
        headers: formData.getHeaders(),
        responseType: "arraybuffer",
      },
    );

    // Save the response image as a file
    const newImagePath = path.resolve(
      `${ROOT_DIR}/images/cropped/${Date.now()}-cropped_image.jpg`,
    );
    fs.writeFileSync(newImagePath, response.data);
    logger.success(
      "extract-people-from-image",
      "Cropped image saved successfully.",
    );
    return newImagePath;
  } catch (error) {
    logger.error(
      "extract-people-from-image",
      `Error extracting people from image: ${(error as AxiosError).message}`,
    );
    throw new Error("Failed to extract people from image.");
  }
}

const ExtractPeopleFromImageTool = new DynamicStructuredTool({
  name: "extract-people-from-image",
  description: "Extracts people from an image",
  schema: z.object({
    imagePath: z.string(),
  }),
  func: async ({ imagePath }) => await toolsServiceHandler(imagePath),
});

export default ExtractPeopleFromImageTool;
