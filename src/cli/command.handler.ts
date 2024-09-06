import { logger } from "@utils/colored-log.util";

export interface Command {
  value: string;
  description: string;
  nextNode: string;
}

export class CommandHandler {
  private readonly handledFor: string; // The node for which the commands are handled
  private commands: Record<string, Command>;

  constructor(commands: Record<string, Command>, handledFor: string) {
    this.commands = commands;
    this.handledFor = handledFor;
  }

  // Get a description of all commands for the user prompt
  getCommandDescription(): string {
    return Object.values(this.commands)
      .map((cmd) => `${cmd.value} for ${cmd.description}`)
      .join(", ");
  }

  // Process the user input and return the next node or an empty string for invalid input
  handleCommand(input: string): string {
    const command = Object.values(this.commands).find(
      (cmd) => cmd.value === input.toUpperCase(),
    );

    if (command) {
      this.logCommand(command);
      return command.nextNode;
    } else {
      logger.error(this.handledFor, "Invalid command. Please try again.");
      return ""; // Invalid input
    }
  }

  // Log the appropriate message based on the selected command
  logCommand(command: Command) {
    logger.success(this.handledFor, `User selected: ${command.description}`);
  }

  // Update the command set dynamically
  updateCommands(newCommands: Record<string, Command>) {
    this.commands = newCommands;
  }
}
