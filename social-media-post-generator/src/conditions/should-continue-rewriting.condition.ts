import { END } from "@langchain/langgraph";
import { Channel } from "@langchain/langgraph/pregel";
import { GraphState } from "@state/graph-args.state";
import { NODE_POST_REWRITING } from "@nodes/post-rewriting";
import { NODE_POST_IMAGE_PROMPT_CREATION } from "@nodes/post-image-prompt-creation";

type Output =
  | typeof NODE_POST_IMAGE_PROMPT_CREATION
  | typeof NODE_POST_REWRITING
  | typeof END;

const shouldContinueRewriting = (state: Channel): Output => {
  const { handlingInfo, postData } = (state as GraphState).agentState;
  const { output } = handlingInfo;
  if (postData.isRewritingLimitReached()) {
    return END;
  }
  const isPostApproved = postData.isPostApproved(output + "");
  if (!isPostApproved) {
    postData.incrementRegenerationAttempts();
  }

  return isPostApproved ? NODE_POST_IMAGE_PROMPT_CREATION : NODE_POST_REWRITING;
};
export default shouldContinueRewriting;
