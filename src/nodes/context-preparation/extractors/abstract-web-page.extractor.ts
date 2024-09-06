import { Page } from "playwright";

export abstract class WebPageExtractor {
  protected _url: string;
  //get url method
  public get url(): string {
    return this._url;
  }

  abstract evaluate(page: Page): Promise<string>;
}
