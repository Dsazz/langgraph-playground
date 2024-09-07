import Updatable from "@state/models/abstract/updatable.model";

class HandlingInfo extends Updatable<HandlingInfo> {
  handledBy: string;
  input: string | null;
  output: string | null;

  constructor() {
    super();
    this.handledBy = "";
    this.input = null;
    this.output = null;
  }
}
export default HandlingInfo;
