import { CtrlWrapper } from "../../src/wrappers/ctrl-wrapper";
import { modelOptionsDataMock } from "./modelOptionsData.mock";

class CtrlWrapperMock extends CtrlWrapper {
  data;

  constructor() {
    super({
      data: modelOptionsDataMock,
      modelName: "test",
      modelsName: "tests"
    });
  }

  refreshCollection() {
    this.data.collection = [
      { id: "1", name: "yam", age: "20" },
      { id: "2", name: "mor", age: "22" },
      { id: "3", name: "uri", age: "24" },
      { id: "4", name: "bar", age: "26" },
      { id: "5", name: "idit", age: "28" }
    ];
  }
}

export const ctrlWrapperMock = new CtrlWrapperMock();