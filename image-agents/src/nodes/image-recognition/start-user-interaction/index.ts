import { GraphState } from "@state/graph-args.state";
import { END } from "@langchain/langgraph";
import getImageList from "@utils/get-image-list.util";
import { logger } from "@utils/colored-log.util";
import { Command } from "@common-cli/command.handler";
import promptUser from "@utils/prompt-user.util";

export const NODE_IMAGE_RECOGNITION_START_USER_INTERACTION =
  "image-recognition.start-user-interaction.node";

export const startImageRecognitionInteractionNode = async (
  state: GraphState,
): Promise<GraphState> => {
  const images = getImageList();
  if (!images.length) {
    logger.warn(
      NODE_IMAGE_RECOGNITION_START_USER_INTERACTION,
      "No images found in the directory.",
    );
    return { input: state.output, output: END, logs: [] };
  }

  const imageOptions: Command[] = images.map((image, index) => ({
    key: index.toString(),
    name: image,
    value: image,
  }));
  imageOptions.push({ key: "E", name: "Exit", value: END });

  const selectedImage = await promptUser(
    "Please select an image:",
    imageOptions,
  );

  return {
    input: state.output,
    output: selectedImage,
    logs: [
      `${NODE_IMAGE_RECOGNITION_START_USER_INTERACTION}: Selected image: ${selectedImage}`,
    ],
  };
};
