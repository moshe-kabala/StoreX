import { createCollection } from "./collection";
import { createState } from "./state";
import { createView, ViewTransform } from "./view";
const names = ["moshe", "liav", "amit"];
let postCount = 0,
  preCount = 0;
const state1 = createState({ name: names[0] });
const state2 = createState({ name: names[1] });
const state3 = createState({ name: names[2] });

const transform: ViewTransform = (sources: any, { oldData, context }) => {
  const names = [];
  for (let s of sources) {
    if (s.dispatcher) {
      s = s.dispatcher;
    }
    names.push(s.state.name);
  }
  return names;
};

const view = createView({
  transform,
  dispatchers: [
    state1,
    {
      dispatcher: state2,
      onDispatch: {
        pre: () => preCount++,
        post: () => postCount++
      }
    },
    state3
  ]
});

state2.setState({ name: names[0] });

expect(view.data).toEqual(names);
