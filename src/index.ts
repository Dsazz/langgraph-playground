import { END, START, StateGraph } from "@langchain/langgraph";
import {
  contextPreparationNode,
  NODE_CONTEXT_PREPARATION,
} from "@nodes/context-preparation";
import { NODE_POST_CREATION, postCreationNode } from "@nodes/post-creation";
import {
  NODE_POST_CRITICIZING,
  postCriticizingNode,
} from "@nodes/post-criticizing";
import { NODE_POST_REWRITING, postRewritingNode } from "@nodes/post-rewriting";
import {
  NODE_POST_PUBLISHING,
  postPublishingNode,
} from "@nodes/post-publishing";
import {
  NODE_POST_USER_DECISION,
  postUserDecisionNode,
} from "@nodes/post-user-decision";
import { logger } from "@utils/colored-log.util";
import { postPublishingUserDecisionCondition } from "@conditions/post-publishing-user-decision.condition";
import shouldContinueRewriting from "@conditions/should-continue-rewriting.condition";
import { graphStateArgs } from "@state/graph-args.state";
import AgentState from "@state/agent.state";
import PostData from "@state/models/post-data.model";
import { ZodError } from "zod";
import {
  NODE_POST_IMAGE_PROMPT_CREATION,
  postImagePromptCreationNode,
} from "@nodes/post-image-prompt-creation";
import {
  NODE_POST_IMAGE_CREATION,
  postImageCreationNode,
} from "@nodes/post-image-creation";

const workflow = new StateGraph(graphStateArgs)
  /* Node Definitions */
  .addNode(NODE_CONTEXT_PREPARATION, contextPreparationNode)
  .addNode(NODE_POST_CREATION, postCreationNode)
  .addNode(NODE_POST_CRITICIZING, postCriticizingNode)
  .addNode(NODE_POST_REWRITING, postRewritingNode)
  .addNode(NODE_POST_IMAGE_PROMPT_CREATION, postImagePromptCreationNode)
  .addNode(NODE_POST_IMAGE_CREATION, postImageCreationNode)
  .addNode(NODE_POST_USER_DECISION, postUserDecisionNode)
  .addNode(NODE_POST_PUBLISHING, postPublishingNode)

  /* Edge Definitions */
  .addEdge(START, NODE_CONTEXT_PREPARATION)
  .addEdge(NODE_CONTEXT_PREPARATION, NODE_POST_CREATION)
  .addEdge(NODE_POST_CREATION, NODE_POST_CRITICIZING)
  .addConditionalEdges(NODE_POST_CRITICIZING, shouldContinueRewriting, [
    NODE_POST_REWRITING,
    NODE_POST_IMAGE_PROMPT_CREATION,
  ])
  .addEdge(NODE_POST_REWRITING, NODE_POST_CRITICIZING)
  .addEdge(NODE_POST_IMAGE_PROMPT_CREATION, NODE_POST_IMAGE_CREATION)
  .addEdge(NODE_POST_IMAGE_CREATION, NODE_POST_USER_DECISION)
  .addConditionalEdges(
    NODE_POST_USER_DECISION,
    postPublishingUserDecisionCondition,
    [
      NODE_CONTEXT_PREPARATION,
      NODE_POST_IMAGE_PROMPT_CREATION,
      NODE_POST_PUBLISHING,
      END,
    ],
  )
  .addEdge(NODE_POST_PUBLISHING, END);

const graph = workflow.compile({
  // checkpointer: new MemorySaver(),
});

const CURRENT_POST_TOPIC = "top 5 Tech news today";
async function runGraph() {
  logger.info1("graph-workflow", "-> Invoking the workflow...");
  try {
    await graph.invoke({
      agentState: AgentState.initialize({
        postData: new PostData().update({ topic: CURRENT_POST_TOPIC }),
      }),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error(
        "graph-workflow",
        "Workflow failed due to validation error:",
      );
      logger.error(
        "graph-workflow",
        error.errors.map((e) => `  * ${e.message}`).join("\n"),
      );
    } else {
      logger.error("graph-workflow", "Workflow failed:");
      logger.error("graph-workflow", (error as Error).message);
    }
  }

  logger.info1("graph-workflow", "<- Workflow finished!");
}
runGraph();
