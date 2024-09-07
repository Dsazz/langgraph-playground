abstract class Updatable<T extends object> {
  update(updates: Partial<T>): T {
    return Object.assign(
      new (this.constructor as { new (): T })(),
      this,
      updates,
    );
  }
}
export default Updatable;
