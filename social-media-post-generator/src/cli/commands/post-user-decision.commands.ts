import { NODE_POST_PUBLISHING } from "@nodes/post-publishing";
import { NODE_CONTEXT_PREPARATION } from "@nodes/context-preparation";
import { END } from "@langchain/langgraph";
import { NODE_POST_IMAGE_PROMPT_CREATION } from "@nodes/post-image-prompt-creation";
import { Command } from "@cli/command.handler";

const POST_USER_DECISION_COMMANDS = Object.freeze({
  YES: {
    key: "Y",
    name: "Approve and Publish Post",
    value: NODE_POST_PUBLISHING,
  },
  RECREATE: {
    key: "R",
    name: "Recreate Post",
    value: NODE_CONTEXT_PREPARATION,
  },
  NEW_IMAGE: {
    key: "I",
    name: "Generate New Image",
    value: NODE_POST_IMAGE_PROMPT_CREATION,
  },
  EXIT: { key: "E", name: "Exit", value: END },
} as Record<string, Command>);
export default POST_USER_DECISION_COMMANDS;
