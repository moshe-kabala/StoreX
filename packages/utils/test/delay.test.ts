import { delay, sleep } from "../src/async"
import "jest"

function reduceArgsToArray(state, item) {
    if (!state) {
        state = [];
    }
    state.push(item);
    return state;
}

class UseDelay {
    result = [];


    @delay({
        reduceArgs: reduceArgsToArray,
        time: 1000
    })
    addToResult(state) {
        this.result.push(state);
    }

}



describe("Delay", () => {

    test("Base functionality", async () => {

        const result = [];

        const WrappedFunc = delay({
            reduceArgs: reduceArgsToArray,
            time: 1000
        })((state) => {
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

    test("Check delay on a method", async () => {
        const ud1 = new UseDelay();
        const ud2 = new UseDelay();

        const expectedResult1 = [
            [1],
            [2, 3, 4],
            [5]
        ]

        const expectedResult2 = [
            [6],
            [7, 8],
            [9]
        ];

        ud1.addToResult(1);
        ud1.addToResult(2);
        ud1.addToResult(3);

        ud2.addToResult(6);
        ud2.addToResult(7);
        await sleep(300);


        ud1.addToResult(4);

        ud2.addToResult(8);
        await sleep(700);


        ud1.addToResult(5);

        ud2.addToResult(9);





        expect(ud1.result).toEqual(expectedResult1)
        expect(ud2.result).toEqual(expectedResult2)
    })

    test("Start delay after 2", async () => {

        const result = [];

        const WrappedFunc = delay({
            reduceArgs: reduceArgsToArray,
            time: 1000, startDelayAfter: 2
        })((state) => {
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

        const WrappedFunc = delay({
            reduceArgs: reduceArgsToArray,
            time: 1000,
            startDelayAfter: 0
        })((state) => {
            result.push(state);
        })

        WrappedFunc(1);
        WrappedFunc(2);
        WrappedFunc(3);
        await sleep(300);
        WrappedFunc(4);
        await sleep(701);
        WrappedFunc(5);
        await sleep(1000);


        expect(result).toEqual([
            [1, 2, 3, 4],
            [5]
        ])

    })

})