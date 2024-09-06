import LinkedInPostStrategy from "@nodes/post-publishing/strategies/linkedIn-post.strategy";
import PostPublisherExecutor from "@nodes/post-publishing/executors/post-publisher.executor";
import { logger } from "@utils/colored-log.util";
import { z } from "zod";
import { GraphState } from "@state/graph-args.state";

export const NODE_POST_PUBLISHING = "post-publishing.node";

const INPUT = z.object({
  postData: z.object({
    content: z.string().min(1, { message: "Content cannot be empty" }),
    imageURL: z.string().min(1, { message: "Image URL cannot be empty" }),
  }),
});
export const postPublishingNode = async ({
  agentState,
}: GraphState): Promise<GraphState> => {
  logger.info1(NODE_POST_PUBLISHING, "Publishing the post...");

  const input = INPUT.parse(agentState);
  const { postData } = input;
  const { content, imageURL } = postData;

  logger.info(NODE_POST_PUBLISHING, "Choose LinkedIn post strategy...");
  const strategy = new LinkedInPostStrategy();

  const postPublisher = new PostPublisherExecutor(strategy);
  await postPublisher.publish(content, imageURL);
  logger.success(NODE_POST_PUBLISHING, "Post published successfully!");

  return {
    agentState: agentState.update({
      handlingInfo: agentState.handlingInfo.update({
        handledBy: NODE_POST_PUBLISHING,
        output: "Post successfully published",
      }),
    }),
  };
};
