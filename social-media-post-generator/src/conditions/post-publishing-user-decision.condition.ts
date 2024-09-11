import { Channel } from "@langchain/langgraph/pregel";
import { NODE_CONTEXT_PREPARATION } from "@nodes/context-preparation";
import { GraphState } from "@state/graph-args.state";
import POST_USER_DECISION_COMMANDS from "@cli/commands/post-user-decision.commands";
import { NODE_POST_IMAGE_PROMPT_CREATION } from "@nodes/post-image-prompt-creation";
import { NODE_POST_PUBLISHING } from "@nodes/post-publishing";
import { END } from "@langchain/langgraph";

const ALLOWED_PUBLISHING_DECISIONS = Object.values(
  POST_USER_DECISION_COMMANDS,
).map((command) => command.value);

type Output =
  | typeof NODE_CONTEXT_PREPARATION
  | typeof NODE_POST_IMAGE_PROMPT_CREATION
  | typeof NODE_POST_PUBLISHING
  | typeof END;

export const postPublishingUserDecisionCondition = async (
  state: Channel,
): Promise<Output> => {
  const { handlingInfo } = (state as GraphState).agentState;
  const { output } = handlingInfo;
  if (!output) {
    throw new Error("Post publishing decision is missing.");
  }

  if (!ALLOWED_PUBLISHING_DECISIONS.includes(output)) {
    throw new Error(
      `Invalid publishing decision: ${output}. Allowed decisions: ${ALLOWED_PUBLISHING_DECISIONS}`,
    );
  }

  if (output === NODE_CONTEXT_PREPARATION) {
    (state as GraphState).agentState.postData.resetRewritingAttempts();
  }

  return output as Output;
};
