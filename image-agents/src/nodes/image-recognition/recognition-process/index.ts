import { logger } from "@utils/colored-log.util";
import { GraphState } from "@state/graph-args.state";
import { z } from "zod";
import ImageRecognitionTool from "@tools/image-recognition.tool";
import performanceTime from "@utils/performance.util";
import path from "node:path";
import { ROOT_DIR } from "@constants/path.constant";

export const NODE_IMAGE_RECOGNITION_PROCESS = "image-recognition.process.node";

const INPUT = z.object({
  output: z.string().min(1, { message: "Image name cannot be empty" }),
});
export const imageRecognitionProcessNode = async (
  state: GraphState,
): Promise<GraphState> => {
  logger.info1(
    NODE_IMAGE_RECOGNITION_PROCESS,
    "Starting image recognition process node...",
  );

  const { output } = INPUT.parse(state);

  const result = await performanceTime(
    async () =>
      await ImageRecognitionTool.invoke({
        imagePath: path.resolve(`${ROOT_DIR}/images/${output}`),
      }),
  );

  logger.success1(NODE_IMAGE_RECOGNITION_PROCESS, `RESULT: ${result}`);

  return {
    input: output,
    output: result,
  };
};
