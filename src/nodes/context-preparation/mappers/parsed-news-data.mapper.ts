import { ParsedNewsData } from "../entities/index.js";
import { Document } from "@langchain/core/documents";

class ParsedNewsDataMapper {
  static listToDocuments(data: ParsedNewsData[]): Document[] {
    return data.map(({ title, url }) => {
      return new Document({
        pageContent: `${title}`,
        metadata: { title, url },
      });
    });
  }
}
export default ParsedNewsDataMapper;
