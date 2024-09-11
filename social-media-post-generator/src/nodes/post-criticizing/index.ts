import { SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import getLLM from "@utils/get-llm.util";
import trim from "@utils/trim-extra-spaces.util";
import {
  AND,
  CAN_NOT,
  CONTAINS,
  CONTEXT,
  DO_NOT,
  IF,
  IF_NOT,
  INSTRUCTIONS,
  LINKEDIN_POST,
  MUST,
  MUST_CONTAIN,
  ONLY,
  OR,
  REMINDER,
  THEN,
  WITHOUT,
} from "@constants/prompt-terminology.constant";
import { logger } from "@utils/colored-log.util";
import { z } from "zod";
import { GraphState } from "@state/graph-args.state";
import { POST_APPROVED_MARK } from "@state/models/post-data.model";

export const NODE_POST_CRITICIZING = "post-criticizing.node";

const INPUT = z.object({
  postData: z.object({
    context: z.string().min(1, { message: "Context cannot be empty" }),
    content: z.string().min(1, { message: "Post cannot be empty" }),
    topic: z.string().min(1, { message: "Post topic cannot be empty" }),
  }),
});
export const postCriticizingNode = async ({
  agentState,
}: GraphState): Promise<GraphState> => {
  logger.info1(NODE_POST_CRITICIZING, "Criticizing post...");

  const input = INPUT.parse(agentState);
  const { postData } = input;
  const { context, topic } = postData;

  const chatPrompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(
      trim(`
        ${INSTRUCTIONS}:
        You are a personal social media critic, especially of ${LINKEDIN_POST}S.
        
        Your task is to provide a short feedback on a written ${LINKEDIN_POST} about ${topic}, so the writer will know how to improve it.
        Compare the given ${LINKEDIN_POST} with the ${CONTEXT} data. 
        The ${LINKEDIN_POST} ${MUST_CONTAIN} data ${ONLY} from the ${CONTEXT}.
        
        Use this ### ${CONTEXT}: ${context} ###
        
        ${IF} the ${LINKEDIN_POST} is well-written and formatted, like a real ${LINKEDIN_POST} about ${topic} 
          ${AND} ${CONTAINS} ${ONLY} information from the ${CONTEXT} data 
          ${WITHOUT} any hallucinations news OR additional information
          ${THEN} you ${MUST} return ${POST_APPROVED_MARK},
        ${IF_NOT}, then provide a short critique of the post.
        
        If you ${CAN_NOT} assist with the task, then explain why you can't handle it.
        
        ### ${LINKEDIN_POST} for analyzing: ${postData.content} ###
        
        ${REMINDER}: 
          Return the criticism of the ${LINKEDIN_POST}
            ${OR} return ${POST_APPROVED_MARK} ${IF} you think the ${LINKEDIN_POST} is well-written 
            ${AND} contains ${ONLY} the information from the ${CONTEXT} data.
          ${DO_NOT} use internet search engines to find additional information.
      `),
    ),
  ]);
  const chain = chatPrompt.pipe(getLLM());
  const { content } = await chain.invoke({});
  logger.success(NODE_POST_CRITICIZING, "Post criticized successfully!");
  logger.info(NODE_POST_CRITICIZING, content.toString());

  return {
    agentState: agentState.update({
      handlingInfo: agentState.handlingInfo.update({
        handledBy: NODE_POST_CRITICIZING,
        input: agentState.handlingInfo.output,
        output: agentState.postData.isPostApproved(content.toString())
          ? POST_APPROVED_MARK
          : content.toString(),
      }),
    }),
  };
};
