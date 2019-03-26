import { delay, sleep } from "./async"

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


async function main() {

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
        [9, 10]

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
    ud2.addToResult(10);
    console.log(ud1.result);
    console.log(ud2.result);

}

main();

