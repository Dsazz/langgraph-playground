import { logger } from "@utils/colored-log.util";
import errorHandler from "@utils/error-handler.util";
import { channels } from "@state/graph-args.state";
import { END, START, StateGraph } from "@langchain/langgraph";
import {
  NODE_IMAGE_RECOGNITION_START_USER_INTERACTION,
  startImageRecognitionInteractionNode,
} from "src/nodes/image-recognition/start-user-interaction";
import shouldContinueImageHandlingCondition from "@conditions/should-continue-image-handling.condition";
import {
  imageRecognitionProcessNode,
  NODE_IMAGE_RECOGNITION_PROCESS,
} from "src/nodes/image-recognition/recognition-process";
import {
  NODE_IMAGE_CREATION_START_USER_INTERACTION,
  startImageCreationInteractionNode,
} from "@nodes/image-creation/start-user-interaction";
import {
  imageCreationProcessNode,
  NODE_IMAGE_CREATION_PROCESS,
} from "@nodes/image-creation/creation-process";
import {
  chooseAgentTypeNode,
  NODE_CHOOSE_AGENT_TYPE,
} from "@nodes/choose-agent-type";
import {
  NODE_IMAGE_CROPPING_START_USER_INTERACTION,
  startImageCroppingInteractionNode,
} from "@nodes/image-people-cropping/start-user-interaction";
import {
  imageCroppingProcessNode,
  NODE_IMAGE_CROPPING_PROCESS,
} from "@nodes/image-people-cropping/cropping-process";

const workflow = new StateGraph({ channels })
  /* Define nodes */
  .addNode(NODE_CHOOSE_AGENT_TYPE, chooseAgentTypeNode)

  .addNode(
    NODE_IMAGE_RECOGNITION_START_USER_INTERACTION,
    startImageRecognitionInteractionNode,
  )
  .addNode(NODE_IMAGE_RECOGNITION_PROCESS, imageRecognitionProcessNode)

  .addNode(
    NODE_IMAGE_CREATION_START_USER_INTERACTION,
    startImageCreationInteractionNode,
  )
  .addNode(NODE_IMAGE_CREATION_PROCESS, imageCreationProcessNode)

  .addNode(
    NODE_IMAGE_CROPPING_START_USER_INTERACTION,
    startImageCroppingInteractionNode,
  )
  .addNode(NODE_IMAGE_CROPPING_PROCESS, imageCroppingProcessNode)

  /* Define edges */
  .addEdge(START, NODE_CHOOSE_AGENT_TYPE)
  .addConditionalEdges(
    NODE_CHOOSE_AGENT_TYPE,
    shouldContinueImageHandlingCondition,
    [
      NODE_IMAGE_RECOGNITION_START_USER_INTERACTION,
      NODE_IMAGE_CREATION_START_USER_INTERACTION,
      NODE_IMAGE_CROPPING_START_USER_INTERACTION,
      END,
    ],
  )
  .addEdge(
    NODE_IMAGE_RECOGNITION_START_USER_INTERACTION,
    NODE_IMAGE_RECOGNITION_PROCESS,
  )
  .addEdge(NODE_IMAGE_RECOGNITION_PROCESS, END)

  .addEdge(
    NODE_IMAGE_CREATION_START_USER_INTERACTION,
    NODE_IMAGE_CREATION_PROCESS,
  )
  .addEdge(NODE_IMAGE_CREATION_PROCESS, END)

  .addEdge(
    NODE_IMAGE_CROPPING_START_USER_INTERACTION,
    NODE_IMAGE_CROPPING_PROCESS,
  )
  .addEdge(NODE_IMAGE_CROPPING_PROCESS, END);

const graph = workflow.compile();

async function runGraph() {
  logger.info1("graph-workflow", "-> Invoking the workflow...");

  try {
    await graph.invoke({});
  } catch (error) {
    errorHandler("graph-workflow", error);
  }

  logger.info1("graph-workflow", "<- Workflow finished!");
}

runGraph();
