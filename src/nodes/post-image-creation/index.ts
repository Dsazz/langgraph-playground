import { z } from "zod";
import { GraphState } from "@state/graph-args.state";
import { logger } from "@utils/colored-log.util";
import { DallEAPIWrapper } from "@langchain/openai";

export const NODE_POST_IMAGE_CREATION = "post-image-creation.node";

const INPUT = z.object({
  handlingInfo: z.object({
    output: z.string().min(1, { message: "Image prompt cannot be empty" }),
  }),
});
export const postImageCreationNode = async ({
  agentState,
}: GraphState): Promise<GraphState> => {
  logger.info1(NODE_POST_IMAGE_CREATION, "Creating image...");

  const input = INPUT.parse(agentState);
  const { handlingInfo } = input;
  const { output: imagePrompt } = handlingInfo;

  const tool = new DallEAPIWrapper({
    n: 1, // Default
    model: "dall-e-3", // Default
  });

  const imageURL = await tool.invoke(imagePrompt);
  logger.success(NODE_POST_IMAGE_CREATION, "Image created successfully!");
  logger.info(NODE_POST_IMAGE_CREATION, `Image URL: ${imageURL}`);

  return {
    agentState: agentState.update({
      handlingInfo: agentState.handlingInfo.update({
        handledBy: NODE_POST_IMAGE_CREATION,
        input: agentState.handlingInfo.output,
        output: imageURL,
      }),
      postData: agentState.postData.update({
        imageURL: imageURL,
      }),
    }),
  };
};
