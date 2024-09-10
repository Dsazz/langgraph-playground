import { logger } from "@utils/colored-log.util";
import * as path from "node:path";
import * as process from "node:process";
import ImageCaptioningTool from "./tools/image-captioning.tool";
import TextToImageTool from "./tools/text-to-image.tool";
import errorHandler from "@utils/error-handler.util";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import trim from "@utils/trim-extra-spaces.util";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";

export const ROOT_DIR = path.resolve(`${process.cwd()}/src`);

async function runGraph() {
  logger.info1("graph-workflow", "-> Invoking the workflow...");
  try {
    // TEXT FROM AUDIO
    // logger.info1("graph-workflow", "Transcribing audio...");
    // const audioPath = path.resolve(`${currentDir}/audio/sample-1.wav`);
    // logger.info("graph-workflow", `Current directory: ${audioPath}`);
    // const audioBuffer = fs.readFileSync(audioPath);
    // logger.info("graph-workflow", "Audio loaded successfully!");
    // const res = await asrTool.invoke({ audioBuffer });
    // logger.success("graph-workflow", `Transcribed audio: ${res}`);
    // const imageBuffer = fs.readFileSync(imagePath);
    // logger.info("graph-workflow", "Image loaded successfully!");
    // const res = await OCRTool.invoke({ imageBuffer });

    //IMAGE FROM TEXT
    // const text = "A dog is playing in the park";
    // const text = "The cat that flies in the sky on an elephant";
    const text = "A dog riding on a skateboard";
    // const text = "Poodle with wings";

    // logger.info1("graph-workflow", "Generating image from text...");
    // const imagePath = await performanceTime(
    //   async () => await TextToImageTool.invoke({ text }),
    // );
    // logger.success("graph-workflow", `Image generated successfully!`);
    //
    // // TEXT FROM IMAGE
    // logger.info1("graph-workflow", "Capturing image...");
    // await performanceTime(
    //   async () => await ImageCaptioningTool.invoke({ imagePath }),
    // );
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-2024-08-06",
      temperature: 0,
    });
    const tools = [TextToImageTool, ImageCaptioningTool];
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
        5. Repeat the process until the image matches the input text with limit to 2 attempts.
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
    const result = await agentExecutor.invoke({ input: text });
    logger.success("graph-workflow", "Agent created successfully!");
    logger.success("graph-workflow", `Result: ${result.output}`);
  } catch (error) {
    errorHandler("graph-workflow", error);
  }

  logger.info1("graph-workflow", "<- Workflow finished!");
}

runGraph();
