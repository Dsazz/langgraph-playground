import { logger } from "@utils/colored-log.util";
import { GraphState } from "@state/graph-args.state";
import { z } from "zod";
import performanceTime from "@utils/performance.util";
import path from "node:path";
import { ROOT_DIR } from "@constants/path.constant";
import ExtractPeopleTool from "@tools/extract-people.tool";

export const NODE_IMAGE_CROPPING_PROCESS = "image-cropping.process.node";

const INPUT = z.object({
  output: z.string().min(1, { message: "Image name cannot be empty" }),
});

export const imageCroppingProcessNode = async (
  state: GraphState,
): Promise<GraphState> => {
  logger.info1(
    NODE_IMAGE_CROPPING_PROCESS,
    "Starting image cropping process node...",
  );

  const { output } = INPUT.parse(state);

  let result = "";
  try {
    result = await performanceTime(
      async () =>
        await ExtractPeopleTool.invoke({
          imagePath: path.resolve(`${ROOT_DIR}/images/${output}`),
        }),
    );

    logger.success1(NODE_IMAGE_CROPPING_PROCESS, `RESULT: ${result}`);
  } catch (error) {
    result = (error as Error).message;
  }

  return {
    input: output,
    output: result,
  };
};
