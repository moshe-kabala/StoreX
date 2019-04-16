
import * as moment from "moment";
import * as m from './models';


export class CustomDate implements m.ICustomDate {
    Date;
    year;
    month;
    date;
    day;
    hours;
    minutes;
    seconds;
  
    constructor(date?) {
      var date = toDate(date);
      this.init(date);
    }
  
    init(date) {
      this.Date = date;
      this.year = date.getFullYear();
      this.month = date.getMonth() + 1; // return 1 less.
      this.date = date.getDate();
      this.day = date.getDay() + 1; // return 1 less.
      this.hours = date.getHours();
      this.minutes = date.getMinutes();
      this.seconds = date.getSeconds();
    }
  
    update(date?) {
      date = toDate(date);
      this.init(date);
      return this;
    }
    asFileName() {
      var paramsDate = this.getAsArray([
        "year",
        "month",
        "date",
        "hours",
        "minutes",
        "seconds"
      ]);
      return paramsDate.join(m.FILE_SEPARATE);
    }

    asCustom(format) {
      return moment(this.Date).format(format);
    }
  
    asView() {
      return moment(this.Date).format("MMM D, YYYY H:mm");
    }

    fromNow() {
      return moment(this.Date).fromNow();
    }

    asSeconds() {
      return moment(this.Date).format("MMM D, YYYY H:mm:ss");
    }
  
    asMillis() {
      return moment(this.Date).format("MMM D, YYYY H:mm:ss.SSS");
    }
  
    toTimestamp(date) {
      var date = date || this.date;
      date = toDate(date);
      if (date instanceof Date) return date.getTime();
  
      return -1;
    }
  
    asCsv() {
      return moment(this.Date).format("MMM D, YYYY H:mm");
    }
  
    asShortFileName() {
      return moment(this.Date).format("D-M-YY");
    }
  
    getDateAsArray(arg, format) {
      var timeOrDateOrAll = "date";
      return this.getAsArray(arg, format, timeOrDateOrAll);
    }
  
    getTimeAsArray(arg, format) {
      var timeOrDateOrAll = "time";
      return this.getAsArray(arg, format, timeOrDateOrAll);
    }
  
    getAsArray(arg, format = m.FORMAT, timeOrDateOrAll = "all") {
      var time = true;
      var date = true;
      switch (timeOrDateOrAll) {
        case "all":
          break;
        case "time":
          date = false;
          break;
        case "date":
          time = false;
          break;
      }
      var paramsDate = [];
      if (date)
        for (var i = 0; i < 3; i++)
          if (arg.indexOf(format[i]) >= 0) paramsDate.push(this[format[i]]);
  
      if (time)
        for (var i = 0; i < 3; i++)
          if (arg.indexOf(m.TIME_ORDER[i]) >= 0)
            paramsDate.push(this[m.TIME_ORDER[i]]);
      return paramsDate;
    }
}
  
export var Guid = guid();

function guid() {
    return {
        row: row
    };

    function row() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
        });
    }
}

export function strTimeToTime(strTime) {
    var type = strTime + "s";
    return moment()
        .subtract(<any>1, type)
        .toDate();
}

export function fromToDateByRange(range) {
    let obj: any = {};
    if (range == "all") {
        obj.from = undefined;
        obj.to = undefined;
    } else {
        obj.from = strTimeToTime(range);
        obj.to = new Date(Date.now());
    }
    return obj;
}

export function fromToTimestampByRange(range) {
    let obj = fromToDateByRange(range);
    if (obj.from) obj.from = obj.from.getTime();
    if (obj.to) obj.to = obj.to.getTime();
    return obj;
}

export function toDate(date: any | number | Date) {
    if (typeof date == "number") {
        var length = Math.round(date).toString().length;
        if (length < 13) {
          date = date * 1000;
        }
        return moment(date).toDate();
    } else if (date && date.toDate) return date.toDate();
    else if (!date) return new Date();
    // else if(!date instanceof Date) todo:instanceof-type
    //     throw TypeError('date is not instanceof Date');
    else return date;
}
