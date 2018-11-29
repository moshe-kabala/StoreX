import { ITimeSpen } from "./models";

export class TimeSpen implements ITimeSpen {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;

  constructor(timeSpen?: TimeSpen | number | Object) {
    this.update(timeSpen || 0);
  }

  update(timeSpen) {
    if (timeSpen instanceof TimeSpen || timeSpen instanceof Object) {
      this.initTimeSpen(timeSpen);
    } else if (isNaN(timeSpen)) {
      throw TypeError("num must be a number");
    } else {
      timeSpen = parseInt(timeSpen);
      this.initNumber(timeSpen);
    }
    return this;
  }

  initNumber(timeSpen) {
    this.days = Math.floor(timeSpen / (60 * 60 * 24));
    this.hours = Math.floor(timeSpen / (60 * 60)) % 24;
    this.minutes = Math.floor(timeSpen / 60) % 60;
    this.seconds = timeSpen % 60;
  }

  initTimeSpen(timeS) {
    this.days = timeS.days;
    this.hours = timeS.hours;
    this.minutes = timeS.minutes;
    this.seconds = timeS.seconds;
  }

  asView() {
    return (
      this.days +
      "d: " +
      this.hours +
      "h: " +
      this.minutes +
      "m: " +
      this.seconds +
      "s"
    );
  }

  asSeconds() {
    let seconds = this.seconds || 0;
    if (this.minutes) {
      seconds += this.minutes * 60;
    }
    if (this.hours) {
      seconds += this.hours * 3600;
    }
    if (this.days) {
      seconds += this.days * 86400;
    }

    return seconds;
  }

  clone() {
    return new TimeSpen(this);
  }
}
