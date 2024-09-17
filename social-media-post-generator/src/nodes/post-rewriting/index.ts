import trim from "@utils/trim-extra-spaces.util";
import {
  CAN_NOT,
  CONTEXT,
  CRITIQUE,
  DO_NOT,
  INSTRUCTIONS,
  LINKEDIN_POST,
  MUST_CONTAIN,
  ONLY,
  REMINDER,
  USE_ONLY,
} from "@constants/prompt-terminology.constant";
import { logger } from "@utils/colored-log.util";
import { GraphState } from "@state/graph-args.state";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";

export const NODE_POST_REWRITING = "post-rewriting.node";
const INPUT = z.object({
  handlingInfo: z.object({
    input: z.string().min(1, { message: "Input cannot be empty" }),
    output: z.string().min(1, { message: "Output cannot be empty" }),
  }),
  postData: z.object({
    content: z.string().min(1, { message: "Content cannot be empty" }),
    context: z.string().min(1, { message: "Context cannot be empty" }),
    topic: z.string().min(1, { message: "Topic cannot be empty" }),
  }),
});
export const postRewritingNode = async ({
  agentState,
}: GraphState): Promise<GraphState> => {
  logger.info1(NODE_POST_REWRITING, "Rewriting post...");

  const input = INPUT.parse(agentState);
  const { handlingInfo, postData } = input;
  const { input: critique, output } = handlingInfo;
  const { content: post, topic, context } = postData;

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      //Write AI prompt here about the Twitter post criticizing
      trim(`
        ${INSTRUCTIONS}:
        You are a personal social media editor, especially of ${LINKEDIN_POST}S.
        
        Your sole task is to edit the given ${LINKEDIN_POST} about ${topic} 
        based on the given ${CRITIQUE} and check that it follows the provided ${CONTEXT} data.
        
        Compare the given ${LINKEDIN_POST} with the ${CONTEXT} data and rewrite the ${LINKEDIN_POST}. 
        The ${LINKEDIN_POST} ${MUST_CONTAIN} data ${ONLY} from the given ${CONTEXT}.
        
        If you ${CAN_NOT} assist with the task, then explain why you can't handle it.
        
        ### ${LINKEDIN_POST} for editing: ${post} ###
        
        ### ${CRITIQUE} for the given ${LINKEDIN_POST}: ${critique} ###
        
        The ${CONTEXT} contains titles and related URLs.
        ### Use this ${CONTEXT} for the given ${LINKEDIN_POST}: ${context} ###
        
        ${REMINDER}: Return the edited ${LINKEDIN_POST} based on the given ${CRITIQUE} and ${CONTEXT}, and nothing else.
          ${USE_ONLY} the information provided in the ${CONTEXT} to write the ${LINKEDIN_POST}.
          ${USE_ONLY} url links provided in the ${CONTEXT}.
          ${DO_NOT} add any hypothetical information or hallucinations.
          ${DO_NOT} use internet search engines to find additional information.
      `),
    ],
  ]);

  const outputParser = new StringOutputParser();
  const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o-2024-08-06",
    temperature: 0.8,
  });
  const chain = prompt.pipe(llm).pipe(outputParser);

  const result = await chain.invoke({});
  logger.success(NODE_POST_REWRITING, "Post rewritten successfully!");

  return {
    agentState: agentState.update({
      handlingInfo: agentState.handlingInfo.update({
        handledBy: NODE_POST_REWRITING,
        input: output,
        output: result,
      }),
      postData: agentState.postData.update({
        content: result,
      }),
    }),
  };
};
