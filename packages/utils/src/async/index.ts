
interface delayArgs {
    reduceArgs?: Function, 
    time: number, 
    startDelayAfter?: number
}


export function delay<T = Function>({ reduceArgs, time, startDelayAfter = 1 }: delayArgs) {
    const state = {
        waiting: false,
        needToWaiting: false,
        delayCallingAmount: 0,
        callingAmount: 0,
        argsState: undefined,
    }

    return (target, propertyKey?: string, descriptor?: PropertyDescriptor) => {

        function _clearState() {
            state.waiting = false;
            state.callingAmount = 0;
            state.delayCallingAmount = 0;
        }

        function _delay() {
            setTimeout(() => {
                _clearState();
                if (state.argsState) {
                    _invoke();
                }
            }, time)
        }

        function _invoke() {
            target(state.argsState);
            // clearing the args state
            state.argsState = undefined;
            _delay();
        }


        return function () {
            if (reduceArgs) {
                // first lets reduce aggregate the arguments
                state.argsState = reduceArgs(state.argsState, ...arguments);
            }
            // if waiting
            if (state.waiting) {
                state.delayCallingAmount++;
                return;
            }

            state.callingAmount++;

            if (state.callingAmount > startDelayAfter) {
                state.waiting = true;
                _delay();
            } else {
                _invoke();
            }

        } as any as T;
    }
}


export function sleep(time = 0) {
    return new Promise(res => {
        setTimeout(() => {
            res();
        }, time);
    });
}