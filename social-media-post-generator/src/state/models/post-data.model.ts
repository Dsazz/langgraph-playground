import Updatable from "@state/models/abstract/updatable.model.js";

export const POST_APPROVED_MARK = "[POST_APPROVED]";
class PostData extends Updatable<PostData> {
  /* topic: The topic of the post */
  topic: string | null;
  /* image: The image of the post */
  imageURL: string | null;
  /* content: The content of the post */
  content: string | null;
  /* context: The context of the post */
  context: string | null;
  /* rewritingAttempts: The number of rewriting attempts */
  rewritingAttempts: number;
  static readonly MAX_REWRITING_ATTEMPTS = 5;

  constructor() {
    super();
    this.topic = null;
    this.imageURL = null;
    this.content = null;
    this.context = null;
    this.rewritingAttempts = 0;
  }

  isRewritingLimitReached(): boolean {
    return this.rewritingAttempts >= PostData.MAX_REWRITING_ATTEMPTS;
  }

  incrementRegenerationAttempts(): PostData {
    if (!this.isRewritingLimitReached()) {
      this.rewritingAttempts++;
    }
    return this;
  }

  resetRewritingAttempts(): PostData {
    this.rewritingAttempts = 0;
    return this;
  }

  isPostApproved = (content: string): boolean =>
    content.includes(POST_APPROVED_MARK);

  extractContextTitles = (): string[] => {
    if (!this.context) {
      return [];
    }

    const jsonContext = JSON.parse(this.context);
    return jsonContext.map((contextItem: { title: string }) =>
      contextItem.title.trim(),
    );
  };
}
export default PostData;
