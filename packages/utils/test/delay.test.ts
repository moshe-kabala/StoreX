import { delay, sleep } from "../src/async"
import "jest"


function ArrayDelay(args) {
    return delay({
        ...args,
        reduceArgs(state, item) {
            if (!state) {
                state = [];
            }
            state.push(item);
            return state;
        }
    })
}

describe("Delay", () => {

    test("Base functionality", async () => {

        const result = [];

        const WrappedFunc = ArrayDelay({ time: 1000 })((state) => {
            result.push(state);
        })

        WrappedFunc(1);

        WrappedFunc(2);
        WrappedFunc(3);
        await sleep(300);
        WrappedFunc(4);

        await sleep(700);
        WrappedFunc(5);

        expect(result).toEqual([
            [1],
            [2, 3, 4],
            [5]
        ])

    })

    test("Start delay after 2", async () => {

        const result = [];

        const WrappedFunc = ArrayDelay({ time: 1000, startDelayAfter: 2 })((state) => {
            result.push(state);
        })

        WrappedFunc(1);
        WrappedFunc(2);
        WrappedFunc(3);
        await sleep(300);
        WrappedFunc(4);

        await sleep(701);
        WrappedFunc(5);

        expect(result).toEqual([
            [1],
            [2],
            [3, 4],
            [5]
        ])

    })

    test("Start delay after 0", async () => {

        const result = [];

        const WrappedFunc = ArrayDelay({ time: 1000, startDelayAfter: 0 })((state) => {
            result.push(state);
        })

        WrappedFunc(1);
        WrappedFunc(2);
        WrappedFunc(3);
        await sleep(300);
        WrappedFunc(4);

        await sleep(700);
        WrappedFunc(5);
        await sleep(1000);


        expect(result).toEqual([
            [1, 2, 3, 4],
            [5]
        ])

    })

})