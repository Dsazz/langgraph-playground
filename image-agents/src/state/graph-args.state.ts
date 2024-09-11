import { StateGraphArgs } from "@langchain/langgraph";

export type GraphState = {
  // Original user input
  input: string;
  // The final output
  output: string;
};
export const channels: StateGraphArgs<GraphState>["channels"] = {
  input: null,
  output: null,
};
