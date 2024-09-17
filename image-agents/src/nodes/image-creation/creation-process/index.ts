import { ChatPromptTemplate } from "@langchain/core/prompts";
import { GraphState } from "@state/graph-args.state";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import process from "node:process";
import TextToImageTool from "@tools/text-to-image.tool";
import ImageRecognitionTool from "@tools/image-recognition.tool";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { logger } from "@utils/colored-log.util";
import trim from "@utils/trim-extra-spaces.util";

export const NODE_IMAGE_CREATION_PROCESS = "image-creation.process.node";

const MAX_REGENERATION_ATTEMPTS = 2;
const INPUT = z.object({
  output: z.string().min(1, { message: "User input cannot be empty" }),
});
export const imageCreationProcessNode = async (
  state: GraphState,
): Promise<GraphState> => {
  logger.info1(
    NODE_IMAGE_CREATION_PROCESS,
    "Starting image creation process node...",
  );

  const { output: input } = INPUT.parse(state);

  const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-2024-08-06",
    temperature: 0,
  });
  const tools = [TextToImageTool, ImageRecognitionTool];
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      trim(`
        You are a chatbot that can generate images from text
        and check if the generated image matches the input text by captioning the image.

        1. Generate an image from the text.
        2. Check if the generated image matches the input text by captioning the image.
        3. Provide the result.
        4. If the image does not match the input text, generate a new image.
        5. Repeat the process until the image matches the input text with limit to {max_attempts} attempts.
      `),
    ],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);
  const agent = createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });
  const { output } = await agentExecutor.invoke({
    input,
    max_attempts: MAX_REGENERATION_ATTEMPTS,
  });
  logger.success(NODE_IMAGE_CREATION_PROCESS, `Image created: ${output}`);

  return {
    input,
    output,
    logs: [`${NODE_IMAGE_CREATION_PROCESS}: Image created: ${output}`],
  };
};
