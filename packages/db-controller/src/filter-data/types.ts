export type sortObjDeprecated = { key: string; reverse: boolean };
export enum orders {
  asc = "asc",
  desc = "desc"
}
export type sortObj = { key: string; order: orders };

export type limitObj = { from: number; to: number; limit: number };
