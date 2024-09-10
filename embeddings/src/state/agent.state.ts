import HandlingInfo from "@state/models/handling-info.model";
import PostData from "@state/models/post-data.model";
import Updatable from "@state/models/abstract/updatable.model";

class AgentState extends Updatable<AgentState> {
  handlingInfo: HandlingInfo;
  postData: PostData;

  constructor() {
    super();
    this.handlingInfo = new HandlingInfo();
    this.postData = new PostData();
  }

  static initialize(initialValues: Partial<AgentState>): AgentState {
    const defaultState = new AgentState();

    return defaultState.update({
      ...initialValues,
    });
  }
}
export default AgentState;
