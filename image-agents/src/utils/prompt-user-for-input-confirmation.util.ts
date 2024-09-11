import inquirer from "inquirer";
import { logger } from "@utils/colored-log.util";

const promptUserForInputConfirmation = async (
  message: string,
  handledFor: string,
): Promise<string> => {
  let confirmed = false;
  let inputText = "";

  while (!confirmed) {
    // Ask the user for input
    const { input } = await inquirer.prompt([
      {
        type: "input",
        name: "input",
        message,
      },
    ]);

    inputText = input.trim();

    // Ask the user if the input is okay
    const { isOk } = await inquirer.prompt([
      {
        type: "confirm",
        name: "isOk",
        message: `You entered: "${inputText}". Is this correct?`,
        default: true,
      },
    ]);

    if (isOk) {
      confirmed = true;
    } else {
      logger.warn(handledFor, "Let's try again.");
    }
  }

  return inputText;
};
export default promptUserForInputConfirmation;
