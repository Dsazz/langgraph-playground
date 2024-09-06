import { SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import getLLM from "@utils/get-llm.util";
import trim from "@utils/trim-extra-spaces.util";
import {
  CAN_NOT,
  CONTEXT,
  DALL_E,
  DO_NOT,
  INSTRUCTIONS,
  MUST,
  REMINDER,
  SHOULD,
  USE_ONLY,
  WHEN,
} from "@constants/prompt-terminology.constant";
import { logger } from "@utils/colored-log.util";
import { GraphState } from "@state/graph-args.state";
import { z } from "zod";

export const NODE_POST_IMAGE_PROMPT_CREATION =
  "post-image-prompt-creation.node";

const INPUT = z.object({
  postData: z.object({
    topic: z.string().min(1, { message: "Topic cannot be empty" }),
    context: z.string().min(1, { message: "Context cannot be empty" }),
  }),
});
export const postImagePromptCreationNode = async ({
  agentState,
}: GraphState): Promise<GraphState> => {
  logger.info1(NODE_POST_IMAGE_PROMPT_CREATION, "Creating image prompt...");

  INPUT.parse(agentState);
  const context = agentState.postData.extractContextTitles().join(".\n");

  const chatPrompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(
      trim(`
         ${INSTRUCTIONS}:
         You are a helpful large language model that generates ${DALL_E} prompts.
        
         Your task is to generate a ${DALL_E} prompt based on the given ${CONTEXT} information which contains titles of the news articles.
         This ${DALL_E} prompt, ${WHEN} given to the ${DALL_E} model, 
         ${SHOULD} help generate beautiful high-quality image for use in social media post.
          
         The ${DALL_E} prompt ${MUST} be clear and concise for the ${DALL_E} model to understand and follow.
         
         If you ${CAN_NOT} assist with the task, then explain why you can't handle it.
        
         ### The given ${CONTEXT} is: ${context} ###
         
         ${REMINDER}: Return the ${DALL_E} prompt text and nothing else.
           It's important to advise the ${DALL_E} model ${DO_NOT} add people's faces and text in the image. 
           ${USE_ONLY} the information provided in the ${CONTEXT} to generate the ${DALL_E} prompt.
           It's important to follow provided instructions and generate a ${DALL_E} prompt that helps create a beautiful image.
      `),
    ),
  ]);
  const chain = chatPrompt.pipe(getLLM());
  const { content } = await chain.invoke({});
  logger.success(
    NODE_POST_IMAGE_PROMPT_CREATION,
    "Image prompt created successfully!",
  );

  return {
    agentState: agentState.update({
      handlingInfo: agentState.handlingInfo.update({
        handledBy: NODE_POST_IMAGE_PROMPT_CREATION,
        input: agentState.handlingInfo.output,
        output: trim(content.toString()),
      }),
    }),
  };
};
