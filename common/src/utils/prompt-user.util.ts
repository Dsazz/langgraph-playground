import inquirer from "inquirer";
import { Command } from "../cli/command.handler.js";

const promptUser = async (
  message: string,
  choices: Command[],
): Promise<string> => {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "command",
      message,
      choices,
    },
  ]);
  return answers.command;
};
export default promptUser;
