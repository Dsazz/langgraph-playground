abstract class BasePostStrategy {
  abstract execute(content: string, imageUrl: string): Promise<string>;
}
export default BasePostStrategy;
