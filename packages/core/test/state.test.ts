import {
    State,
    createState
} from "../src"

describe("State", () => {
    test("Should to created and updated", () => {
        let [name, age] = ["moshe", 28];
        const personState = createState({ name, age })
        const currentState = personState.state;
        expect(currentState).toEqual({ name, age });
        // update the person detalis
        name = "mio";
        age = 8;
        personState.state = { name, age };
        const newState = personState.state;
        expect(newState).toEqual({ name, age });
    })
})