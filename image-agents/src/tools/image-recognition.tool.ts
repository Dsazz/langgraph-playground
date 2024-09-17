import axios, { AxiosError } from "axios";
import process from "node:process";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import imageType from "image-type";
import { firstValueFrom, from, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { RetryConfig } from "rxjs/internal/operators/retry";
import fs from "fs";
import FormData from "form-data";
import { logger } from "@utils/colored-log.util.js";

const HUGGINGFACE_MODEL = "Salesforce/blip-image-captioning-large";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function huggingFaceHandler(imageBuffer: Buffer): Promise<string> {
  const detectedType = await imageType(imageBuffer);

  if (!detectedType) {
    throw new Error("Unable to detect image type from the buffer");
  }

  const request$ = from(
    axios.post(
      `${process.env.HUGGINGFACE_MODELS_URL}/${HUGGINGFACE_MODEL}`,
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACEHUB_API_KEY}`,
          "Content-Type": detectedType.mime,
        },
      },
    ),
  ).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error, retryCount) => {
        if (
          axios.isAxiosError(error) &&
          error.response?.data?.error?.includes("currently loading")
        ) {
          logger.warn(
            "image-caption",
            `Model is currently loading. Retrying... Attempt ${retryCount + 1}`,
          );
          return RETRY_DELAY_MS;
        }
        return throwError(() => error); // No retry if error is not recoverable
      },
    } as RetryConfig),
    catchError((error) => {
      logger.error(
        "image-recognition",
        `Error processing image: ${error.message}`,
      );
      return throwError(
        () => new Error("Failed to load after multiple retries."),
      );
    }),
  );

  const response = await firstValueFrom(request$);

  const generatedText = response?.data?.[0]?.generated_text;
  return generatedText || "";
}

async function toolsServiceHandler(imagePath: string): Promise<string> {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const formData = new FormData();
    formData.append("file", imageBuffer, { filename: "image.jpg" });

    const response = await axios.post(
      `${process.env.TOOLS_SERVICE_URL}/caption`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      },
    );

    return response.data.caption;
  } catch (error) {
    console.log(error);
    logger.error(
      "image-recognition",
      `Error processing image: ${(error as AxiosError).message}`,
    );
    throw new Error("Failed to process image");
  }
}

const ImageRecognitionTool = new DynamicStructuredTool({
  name: "image-recognition",
  description: "Recognize the content of an image",
  schema: z.object({
    imagePath: z.string(),
  }),
  func: async ({ imagePath }) => await toolsServiceHandler(imagePath),
});

export default ImageRecognitionTool;
