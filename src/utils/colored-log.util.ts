import chalk from "chalk";

const logStyles = {
  context: chalk.cyan.bold, // Color for the context name
  message: {
    info: chalk.green,
    warn: chalk.yellow,
    error: chalk.red,
    success: chalk.magenta,
  },
};

export const logger = {
  info: (context: string, message: string) => {
    console.log(
      `${logStyles.context(`[${context}]`)} ${logStyles.message.info(message)}`,
    );
  },
  info1: (context: string, message: string) => {
    console.log(
      `\n${logStyles.context(`[${context}]`)} ${logStyles.message.info(message)}`,
    );
  },
  warn: (context: string, message: string) => {
    console.log(
      `${logStyles.context(`[${context}]`)} ${logStyles.message.warn(message)}`,
    );
  },
  error: (context: string, message: string) => {
    console.log(
      `${logStyles.context(`[${context}]`)} ${logStyles.message.error(message)}`,
    );
  },
  success: (context: string, message: string) => {
    console.log(
      `${logStyles.context(`[${context}]`)} ${logStyles.message.success(message)}`,
    );
  },
};
