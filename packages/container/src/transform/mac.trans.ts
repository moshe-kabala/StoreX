import { upperTransform } from ".";

function asMAC(data: string) {
  if (typeof data === "string" && data) {
    return data
      .toUpperCase()
      .match(/.{1,2}/g)
      .join(":");
  }
  return data;
}

export function macTransform(data: any) {
  return data instanceof Array ? data.map(d => asMAC(d)) : asMAC(data);
}
