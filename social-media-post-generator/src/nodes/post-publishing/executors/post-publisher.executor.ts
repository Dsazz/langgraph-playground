import BasePostStrategy from "@nodes/post-publishing/strategies/base-post.strategy";

class PostPublisherExecutor {
  private postStrategy: BasePostStrategy;

  constructor(postStrategy: BasePostStrategy) {
    this.postStrategy = postStrategy;
  }

  // Publish method accepts only content
  async publish(content: string, imageUrl: string): Promise<string> {
    return await this.postStrategy.execute(content, imageUrl);
  }
}
export default PostPublisherExecutor;
