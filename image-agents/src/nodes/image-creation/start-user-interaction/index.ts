import { GraphState } from "@state/graph-args.state";
import promptUserForInputConfirmation from "@utils/prompt-user-for-input-confirmation.util";

export const NODE_IMAGE_CREATION_START_USER_INTERACTION =
  "image-creation.start-user-interaction.node";

export const startImageCreationInteractionNode = async (
  state: GraphState,
): Promise<GraphState> => {
  const imageTopic = await promptUserForInputConfirmation(
    "Please enter the topic of the image:",
    NODE_IMAGE_CREATION_START_USER_INTERACTION,
  );

  return {
    input: state.output,
    output: imageTopic,
    logs: [
      `${NODE_IMAGE_CREATION_START_USER_INTERACTION}: Selected image topic: ${imageTopic}`,
    ],
  };
};
