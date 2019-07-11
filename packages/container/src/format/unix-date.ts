export function toUnixDate(date: number) {
  if (date == undefined || typeof date !== "number") return date;
  return date > 9999999999 ? date / 1000 : date;
}

export function fromUnixDate(date: number) {
  if (date == undefined || typeof date !== "number") return date;
  return date < 10000000000 ? date * 1000 : date;
}

export function getDateNowUnix() {
  return Date.now() / 1000;
}
