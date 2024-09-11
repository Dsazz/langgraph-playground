import axios from "axios";
import imageType from "image-type";
import path from "node:path";
import fs from "node:fs";
import { logger } from "@utils/colored-log.util";
import process from "node:process";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { from } from "rxjs";
import { catchError, retry, switchMap } from "rxjs/operators";
import { firstValueFrom } from "rxjs";
import { ROOT_DIR } from "@constants/path.constant";

const TEXT_TO_IMAGE_MODEL = "black-forest-labs/FLUX.1-dev";
const MAX_RETRY_COUNT = 3;

async function huggingFaceHandler(text: string): Promise<string> {
  const request$ = from(
    axios.post(
      `${process.env.HUGGINGFACE_MODELS_URL}/${TEXT_TO_IMAGE_MODEL}`,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACEHUB_API_KEY}`,
        },
        responseType: "arraybuffer",
      },
    ),
  ).pipe(
    retry(MAX_RETRY_COUNT),
    switchMap(async (response) => {
      const imageBuffer = response.data;
      const detectedType = await imageType(imageBuffer);
      if (!detectedType) {
        return Promise.reject(
          new Error("Unable to detect image type from the buffer"),
        );
      }

      const fileName = `${Date.now()}_generated_image.${detectedType.ext}`;
      const imagePath = path.join(ROOT_DIR, "/images/generated/", fileName);

      // Ensure directory exists
      fs.mkdirSync(path.dirname(imagePath), { recursive: true });

      // Write the image buffer to a file with the correct extension
      fs.writeFileSync(imagePath, imageBuffer);

      logger.info("text-to-image", `Image saved to ${imagePath}`);
      return imagePath;
    }),
    catchError((error) => {
      logger.error(
        "text-to-image",
        `Failed to fetch image from HuggingFace: ${error.message}`,
      );
      return Promise.reject(
        new Error("Failed to generate image after retries"),
      );
    }),
  );

  return firstValueFrom(request$);
}

const TextToImageTool = new DynamicStructuredTool({
  name: "text-to-image",
  description: "Generates an image from text",
  schema: z.object({
    text: z.string(),
  }),
  func: async ({ text }) => await huggingFaceHandler(text),
});

export default TextToImageTool;
