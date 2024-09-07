import { Page } from "playwright";
import { WebPageExtractor } from "@nodes/context-preparation/extractors/abstract-web-page.extractor";
import { ParsedNewsData } from "@nodes/context-preparation/entities";

class GizmodoEvaluator extends WebPageExtractor {
  constructor() {
    super();
    this._url = "https://gizmodo.com/";
  }

  async evaluate(page: Page): Promise<string> {
    await page.waitForLoadState("domcontentloaded");
    return await page.evaluate(() => {
      const blocks = document
        .querySelector(".tracking-widest")
        ?.nextElementSibling?.querySelectorAll("article");

      const data: ParsedNewsData[] = [];
      blocks?.forEach((elem) => {
        const title = elem.querySelector("h3")?.textContent?.trim();
        const url = elem.querySelector("a")?.getAttribute("href");
        if (title && url) {
          data.push({ title, url });
        }
      });
      return JSON.stringify(data);
    });
  }
}
export default GizmodoEvaluator;
