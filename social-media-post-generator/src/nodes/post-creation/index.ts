import { SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import getLLM from "@utils/get-llm.util";
import trim from "@utils/trim-extra-spaces.util";
import {
  CAN_NOT,
  CONTEXT,
  DO_NOT,
  INSTRUCTIONS,
  LINKEDIN_POST,
  MUST_USE,
  REMINDER,
  USE_ONLY,
} from "@constants/prompt-terminology.constant";
import { logger } from "@utils/colored-log.util";
import { GraphState } from "@state/graph-args.state";
import { z } from "zod";

export const NODE_POST_CREATION = "post-creation.node";

const INPUT = z.object({
  postData: z.object({
    context: z.string().min(1, { message: "Context cannot be empty" }),
    topic: z.string().min(1, { message: "Topic cannot be empty" }),
  }),
});
export const postCreationNode = async ({
  agentState,
}: GraphState): Promise<GraphState> => {
  logger.info1(NODE_POST_CREATION, "Creating post...");

  const input = INPUT.parse(agentState);
  const { postData } = input;
  const { context, topic } = postData;

  const chatPrompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(
      trim(`
        ${INSTRUCTIONS}:
        You are a specialist in creating social media content.
        
        Your sole task is to write a formatted ${LINKEDIN_POST} about ${topic} using the given ${CONTEXT} about the topic.
        The content must be ultra-readable and properly formatted like a real ${LINKEDIN_POST}.
        
        If you ${CAN_NOT} assist with the task, then explain why you can't handle it.
        
        The ${CONTEXT} contains titles and related URL that you ${MUST_USE} to write the post.
        ###Use this ${CONTEXT} for the given ${LINKEDIN_POST}: ${context} ###

        ${REMINDER}: Return the content of the created post and nothing else. Use the information provided in the ${CONTEXT} to write the post. 
          ${USE_ONLY} the information provided in the ${CONTEXT} to write the post.
          ${USE_ONLY} url links provided in the ${CONTEXT}.
          ${DO_NOT} add any hypothetical information or hallucinations.
          ${DO_NOT} use internet search engines to find additional information.
      `),
    ),
  ]);
  const chain = chatPrompt.pipe(getLLM());
  const { content } = await chain.invoke({});
  logger.success(NODE_POST_CREATION, "Post created successfully!");

  return {
    agentState: agentState.update({
      handlingInfo: agentState.handlingInfo.update({
        handledBy: NODE_POST_CREATION,
        input: agentState.handlingInfo.output,
        output: content.toString(),
      }),
      postData: agentState.postData.update({
        content: content.toString(),
      }),
    }),
  };
};
