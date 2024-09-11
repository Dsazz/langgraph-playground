import promptUser from "@utils/prompt-user.util";
import { GraphState } from "@state/graph-args.state";
import { END } from "@langchain/langgraph";
import { NODE_IMAGE_RECOGNITION_START_USER_INTERACTION } from "@nodes/image-recognition/start-user-interaction";
import { NODE_IMAGE_CREATION_START_USER_INTERACTION } from "@nodes/image-creation/start-user-interaction";
import { NODE_IMAGE_CROPPING_START_USER_INTERACTION } from "@nodes/image-people-cropping/start-user-interaction";

export const NODE_CHOOSE_AGENT_TYPE = "choose-agent-type.node";

const COMMANDS = [
  {
    key: "R",
    name: "Image Recognition",
    value: NODE_IMAGE_RECOGNITION_START_USER_INTERACTION,
  },
  {
    key: "C",
    name: "Image Creation",
    value: NODE_IMAGE_CREATION_START_USER_INTERACTION,
  },
  {
    key: "P",
    name: "Image People Cropping",
    value: NODE_IMAGE_CROPPING_START_USER_INTERACTION,
  },
  { key: "E", name: "Exit", value: END },
];
export const chooseAgentTypeNode = async (
  state: GraphState,
): Promise<GraphState> => {
  const selectedAgent = await promptUser("Please select an agent:", COMMANDS);

  return {
    input: state.output,
    output: selectedAgent,
  };
};
