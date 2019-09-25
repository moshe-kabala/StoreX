export class Runner {
  constructor(public target, public theThisFunction) {}

  run = args => {
    this.target.apply(this.theThisFunction, args);
  };
}
