import AgentState from "@state/agent.state";
import { StateGraphArgs } from "@langchain/langgraph";
import { Channel } from "@langchain/langgraph/pregel";
import { ChannelReducers } from "@langchain/langgraph/dist/graph/state";

export type GraphState = {
  agentState: AgentState;
};
export const graphStateArgs = {
  channels: {
    agentState: {
      reducer: (currentState: AgentState, updates: Partial<AgentState>) => {
        return currentState.update(updates);
      },
      default: () => new AgentState(),
    },
  },
} as StateGraphArgs<ChannelReducers<Channel>>;
