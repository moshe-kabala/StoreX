
export const FILE_SEPARATE = "-";
export const FORMAT = ["year", "month", "date"];
export const TIME_ORDER = ["hours", "minutes", "seconds"];

export interface ICustomDate {
    Date;
    year: number;
    month: number;
    date: number;
    day: number;
    hours: number;
    minutes: number;
    seconds: number;
  
    asFileName();
    asShortFileName();
    asView();
    asCsv();
    update(date);
    toTimestamp(date);
}
