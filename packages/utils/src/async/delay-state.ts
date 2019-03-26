
export interface DelayStateOpt {
    reduceArgs?: Function,
    time: number,
    startDelayAfter?: number
}



export class DelayState {
    
    constructor(public target, public opt: DelayStateOpt, public theThisFunction) {
        if (opt.startDelayAfter == undefined) {
            opt.startDelayAfter = 1;
        }
    }

    state = {
        waiting: false,
        delayCallingAmount: 0,
        callingAmount: 0,
        argsState: undefined,
    }

    _clearState= () =>  {
        this.state.waiting = false;
        this.state.callingAmount = 0;
        this.state.delayCallingAmount = 0;
    }

    delay = () =>  {
        setTimeout(() => {
            this._clearState();
            this.invoke();
        }, this.opt.time)
    }

    invoke= () =>  {
        this.target.apply(this.theThisFunction, [this.state.argsState]);
        // clearing the args state
        this.state.argsState = undefined;
        //this.delay();
    }
}