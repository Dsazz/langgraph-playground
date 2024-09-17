import { StateGraphArgs } from "@langchain/langgraph";
import { append } from "@state/helper.state.js";

export type GraphState = {
  // Original user input
  input: string;
  // The final output
  output: string;
  logs: string[];
};
export const channels: StateGraphArgs<GraphState>["channels"] = {
  input: null,
  output: null,
  logs: append<string>(),
};
