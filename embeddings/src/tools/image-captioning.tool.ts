import axios, { AxiosError } from "axios";
import process from "node:process";
import { logger } from "@utils/colored-log.util";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import imageType from "image-type";
import { from, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { firstValueFrom } from "rxjs";
import { RetryConfig } from "rxjs/internal/operators/retry";

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
      logger.error("image-caption", `Error processing image: ${error.message}`);
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
    const response = await axios.post(
      `${process.env.TOOLS_SERVICE_URL}/caption`,
      { image_path: imagePath },
    );
    const caption = response.data.caption;
    logger.success("image-caption", caption);
    return caption;
  } catch (error) {
    logger.error(
      "image-caption",
      `Error fetching caption from tools service: ${(error as AxiosError).message}`,
    );
    throw new Error("Failed to fetch image caption.");
  }
}

const ImageCaptioningTool = new DynamicStructuredTool({
  name: "image-captioning",
  description: "Extracts caption from an image",
  schema: z.object({
    imagePath: z.string(),
  }),
  func: async ({ imagePath }) => await toolsServiceHandler(imagePath),
});

export default ImageCaptioningTool;
