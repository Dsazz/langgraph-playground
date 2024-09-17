import promptUser from "@utils/prompt-user.util";
import { logger } from "@utils/colored-log.util";
import { GraphState } from "@state/graph-args.state";
import { z } from "zod";
import POST_USER_DECISION_COMMANDS from "@cli/commands/post-user-decision.commands";
import { CommandHandler } from "@common-cli/command.handler";

export const NODE_POST_USER_DECISION = "post-user-decision.node";

const INPUT = z.object({
  postData: z.object({
    content: z.string().min(1, { message: "Content cannot be empty" }),
    imageURL: z.string().min(1, { message: "Image URL cannot be empty" }),
  }),
});
export const postUserDecisionNode = async ({
  agentState,
}: GraphState): Promise<GraphState> => {
  logger.info1(
    NODE_POST_USER_DECISION,
    "Starting the post user decision node...",
  );

  const input = INPUT.parse(agentState);
  const { content: post, imageURL } = input.postData;

  logger.info1(
    NODE_POST_USER_DECISION,
    "Please review the post and image, and decide what to do next...",
  );
  logger.info1(NODE_POST_USER_DECISION, "Post content:");
  console.log(post);

  logger.info1(NODE_POST_USER_DECISION, `Image URL: ${imageURL}`);

  const cliHandler = new CommandHandler(
    POST_USER_DECISION_COMMANDS,
    NODE_POST_USER_DECISION,
  );
  const commandOptions = Object.values(POST_USER_DECISION_COMMANDS);
  let decidedPath = "";
  while (!decidedPath) {
    const userInput = await promptUser(
      "Please select the next action:",
      commandOptions,
    );
    decidedPath = cliHandler.handleCommand(userInput);
  }

  return {
    agentState: agentState.update({
      handlingInfo: agentState.handlingInfo.update({
        handledBy: NODE_POST_USER_DECISION,
        output: decidedPath,
      }),
    }),
  };
};
