import { Page } from "playwright";
import { WebPageExtractor } from "@nodes/context-preparation/extractors/abstract-web-page.extractor";
import { ParsedNewsData } from "@nodes/context-preparation/entities";

class TechCrunchExtractor extends WebPageExtractor {
  constructor() {
    super();
    this._url = "https://techcrunch.com/";
  }

  async evaluate(page: Page): Promise<string> {
    await page.waitForLoadState("domcontentloaded");
    return await page.evaluate(() => {
      const blocks = document.querySelectorAll(
        ".wp-block-tc23-post-picker .wp-block-columns .wp-block-column:nth-child(1)",
      );

      const data: ParsedNewsData[] = [];
      blocks.forEach((elem) => {
        const block = elem.querySelector("h2 > a");
        const title = block?.textContent?.trim();
        const url = block?.getAttribute("href");
        if (title && url) {
          data.push({ title, url });
        }
      });

      return JSON.stringify(data);
    });
  }
}
export default TechCrunchExtractor;
