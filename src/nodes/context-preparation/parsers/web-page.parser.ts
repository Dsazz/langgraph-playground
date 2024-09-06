import { PlaywrightWebBaseLoader } from "@langchain/community/document_loaders/web/playwright";
import { Page } from "playwright";
import { WebPageExtractor } from "@nodes/context-preparation/extractors/abstract-web-page.extractor";
import { ParsedNewsData } from "@nodes/context-preparation/entities";

class WebPageParser {
  static async parse(extractor: WebPageExtractor): Promise<ParsedNewsData[]> {
    const loader = new PlaywrightWebBaseLoader(extractor.url, {
      launchOptions: {
        headless: true,
      },
      gotoOptions: {
        waitUntil: "domcontentloaded",
      },
      async evaluate(page: Page) {
        return await extractor.evaluate(page);
      },
    });

    const loadedData = await loader.load();
    return JSON.parse(loadedData[0].pageContent) as ParsedNewsData[];
  }
}
export default WebPageParser;
