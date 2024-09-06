// src/strategies/TelegramPostStrategy.ts
import axios, { HttpStatusCode } from "axios";
import BasePostStrategy from "@nodes/post-publishing/strategies/base-post.strategy";

class TelegramPostStrategy implements BasePostStrategy {
  private readonly _botToken?: string;
  private readonly _chatId?: string;

  constructor() {
    this._botToken = process.env.TELEGRAM_BOT_TOKEN;
    this._chatId = process.env.TELEGRAM_CHAT_ID;
  }

  private validate(): void {
    if (!this._botToken || !this._chatId) {
      throw new Error(
        "Missing Telegram bot token or chat ID in environment variables.",
      );
    }
  }

  async execute(content: string): Promise<string> {
    try {
      this.validate();

      const postUrl = `https://api.telegram.org/bot${this._botToken}/sendMessage`;

      const response = await axios.post(postUrl, {
        chat_id: this._chatId,
        text: content,
      });

      if (response.status === HttpStatusCode.Ok) {
        return "Telegram post published successfully.";
      } else {
        throw new Error(
          `Failed to publish post. Status code: ${response.status}`,
        );
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      throw new Error(`Error while publishing Telegram post: ${error.message}`);
    }
  }
}
export default TelegramPostStrategy;
