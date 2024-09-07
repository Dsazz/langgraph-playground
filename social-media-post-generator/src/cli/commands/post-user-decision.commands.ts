import { NODE_POST_PUBLISHING } from "@nodes/post-publishing";
import { NODE_CONTEXT_PREPARATION } from "@nodes/context-preparation";
import { END } from "@langchain/langgraph";
import { NODE_POST_IMAGE_PROMPT_CREATION } from "@nodes/post-image-prompt-creation";

const POST_USER_DECISION_COMMANDS = Object.freeze({
  YES: {
    value: "Y",
    description: "Approve and Publish Post",
    nextNode: NODE_POST_PUBLISHING,
  },
  RECREATE: {
    value: "R",
    description: "Recreate Post",
    nextNode: NODE_CONTEXT_PREPARATION,
  },
  NEW_IMAGE: {
    value: "I",
    description: "Generate New Image",
    nextNode: NODE_POST_IMAGE_PROMPT_CREATION,
  },
  EXIT: { value: "E", description: "Exit", nextNode: END },
});
export default POST_USER_DECISION_COMMANDS;
