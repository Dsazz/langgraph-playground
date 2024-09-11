import { DynamicStructuredTool } from "@langchain/core/tools";
import process from "node:process";
import axios from "axios";
import { z } from "zod";
import imageType from "image-type";

const ASR_MODEL = "openai/whisper-large-v3";
async function huggingFaceHandler(audioBuffer: Buffer): Promise<string> {
  const detectedType = await imageType(audioBuffer);
  if (!detectedType) {
    throw new Error("Unable to detect image type from the buffer");
  }
  const response = await axios.post(
    `${process.env.HUGGINGFACE_MODELS_URL}/${ASR_MODEL}`,
    audioBuffer,
    {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACEHUB_API_KEY}`,
        "Content-Type": detectedType.mime,
      },
    },
  );

  return response.data.text;
}
/*
 * This tool transcribes audio into text using Hugging Face ASR model
 * ASR - Automatic Speech Recognition
 * @param {Buffer} audioBuffer - The audio buffer to transcribe
 * @returns {string} The transcribed text
 */
const AsrTool = new DynamicStructuredTool({
  name: "automatic-speech-recognition",
  description: "Transcribes audio into text",
  schema: z.object({
    audioBuffer: z.instanceof(Buffer),
  }),
  func: async ({ audioBuffer }) => await huggingFaceHandler(audioBuffer),
});
export default AsrTool;
