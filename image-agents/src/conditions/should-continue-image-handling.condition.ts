import { END } from "@langchain/langgraph";
import { Channel } from "@langchain/langgraph/pregel";
import { GraphState } from "@state/graph-args.state";
import { NODE_IMAGE_CREATION_START_USER_INTERACTION } from "@nodes/image-creation/start-user-interaction";
import { NODE_IMAGE_RECOGNITION_START_USER_INTERACTION } from "@nodes/image-recognition/start-user-interaction";
import { NODE_IMAGE_CROPPING_START_USER_INTERACTION } from "@nodes/image-people-cropping/start-user-interaction";

type Output =
  | typeof NODE_IMAGE_RECOGNITION_START_USER_INTERACTION
  | typeof NODE_IMAGE_CREATION_START_USER_INTERACTION
  | typeof NODE_IMAGE_CROPPING_START_USER_INTERACTION
  | typeof END;

const ALLOWED_NODES = [
  NODE_IMAGE_CREATION_START_USER_INTERACTION,
  NODE_IMAGE_RECOGNITION_START_USER_INTERACTION,
  NODE_IMAGE_CROPPING_START_USER_INTERACTION,
  END,
];
const shouldContinueImageHandling = (state: Channel): Output => {
  const { output } = state as GraphState;
  if (ALLOWED_NODES.includes(output)) {
    return output as Output;
  }
  return END;
};
export default shouldContinueImageHandling;
