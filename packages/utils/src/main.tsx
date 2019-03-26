import { delay, sleep } from "./async"



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

async function main() {



    const result = [];

    const WrappedFunc = ArrayDelay({ time: 1000, startDelayAfter: 2 })((state) => {
        result.push(state);
    })

    WrappedFunc(1);
    WrappedFunc(2);
    WrappedFunc(3);
    await sleep(300);
    WrappedFunc(4);

    await sleep(700);
    WrappedFunc(5);
    
    console.log(result);
}

main();

