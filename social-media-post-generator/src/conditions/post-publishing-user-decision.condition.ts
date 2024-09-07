import { Channel } from "@langchain/langgraph/pregel";
import { NODE_CONTEXT_PREPARATION } from "@nodes/context-preparation";
import { GraphState } from "@state/graph-args.state";
import POST_USER_DECISION_COMMANDS from "@cli/commands/post-user-decision.commands";

const ALLOWED_PUBLISHING_DECISIONS = Object.values(
  POST_USER_DECISION_COMMANDS,
).map((command) => command.nextNode);
export const postPublishingUserDecisionCondition = async (
  state: Channel,
): Promise<string> => {
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

  return output;
};
