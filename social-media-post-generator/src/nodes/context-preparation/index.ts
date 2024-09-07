import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import ParsedNewsDataMapper from "@nodes/context-preparation/mappers/parsed-news-data.mapper";
import GizmodoExtractor from "@nodes/context-preparation/extractors/gizmodo.extractor";
import TechCrunchExtractor from "@nodes/context-preparation/extractors/techcrunch.extractor";
import { logger } from "@utils/colored-log.util";
import WebPageParser from "@nodes/context-preparation/parsers/web-page.parser";
import { GraphState } from "@state/graph-args.state";

export const NODE_CONTEXT_PREPARATION = "context-preparation.node";
export const contextPreparationNode = async ({
  agentState,
}: GraphState): Promise<GraphState> => {
  logger.info1(NODE_CONTEXT_PREPARATION, "Parsing web pages...");
  const loadedDocs = await Promise.all([
    WebPageParser.parse(new GizmodoExtractor()),
    WebPageParser.parse(new TechCrunchExtractor()),
  ]);

  logger.info(NODE_CONTEXT_PREPARATION, "Preparing embedding data...");
  const docs = ParsedNewsDataMapper.listToDocuments(loadedDocs.flat());
  // Create embeddings and perform similarity search
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  logger.info(NODE_CONTEXT_PREPARATION, "Performing similarity search...");
  const newsDocs = await vectorStore.similaritySearch(
    "AI Technology news",
    5, //Number of documents to return.
  );

  logger.info(NODE_CONTEXT_PREPARATION, "Preparing context data...");
  const context = JSON.stringify(
    newsDocs.map((doc) => doc.metadata),
    null,
    2,
  );

  logger.success(
    NODE_CONTEXT_PREPARATION,
    "Context data prepared successfully!",
  );
  return {
    agentState: agentState.update({
      handlingInfo: agentState.handlingInfo.update({
        handledBy: NODE_CONTEXT_PREPARATION,
        input: agentState.handlingInfo.output,
        output: context,
      }),
      postData: agentState.postData.update({
        context,
      }),
    }),
  };
  // return {
  //   agentState: {
  //     ...agentState,
  //     handledBy: NODE_CONTEXT_PREPARATION,
  //     input: agentState.output,
  //     output: context,
  //     context,
  //   },
  // };
};
