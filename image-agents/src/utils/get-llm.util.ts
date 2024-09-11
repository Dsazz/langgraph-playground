import { ChatOpenAI } from "@langchain/openai";

const getLLM = () =>
  new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o-2024-08-06",
    temperature: 0.8,
  });
export default getLLM;
