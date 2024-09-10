import { ZodError } from "zod";
import { logger } from "@utils/colored-log.util";
import { isAxiosError } from "axios";

const errorHandler = (context: string, error: unknown) => {
  if (error instanceof ZodError) {
    logger.error(context, "Workflow failed due to validation error:");
    logger.error(
      "graph-workflow",
      error.errors.map((e) => `  * ${e.message}`).join("\n"),
    );
  } else if (isAxiosError(error)) {
    logger.error("graph-workflow", "Workflow failed:");
    logger.error("graph-workflow", `  * Error: ${error.message}`);
  } else {
    logger.error("graph-workflow", "Workflow failed:");
    logger.error("graph-workflow", `  * Error: ${(error as Error).message}`);
  }
};
export default errorHandler;
