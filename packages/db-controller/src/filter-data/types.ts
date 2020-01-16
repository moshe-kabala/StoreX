/* sort */
export enum orders {
  asc = "asc",
  desc = "desc"
}
export type sortObjDeprecated = { key: string; reverse: boolean };
export type sortObj = { key: string; order: orders };
export type Sort = sortObj | sortObjDeprecated;

/* limit */
export type limitObj = { from: number; to: number; limit: number };

/* filters */
// relations
export enum RelationEnum {
  or = "or",
  and = "and"
}
export const defaultRelation = RelationEnum.and;
export interface Relation {
  relation: RelationEnum;
}
// where
export interface Where {
  key: string;
  path: string;
  value: string | Array<string> | any;
  type?: string;
  operator?: string;
}
// filter
export type Filter = Where | Relation;
export type WhereRelationFilter = Filter | Array<Filter>;
export type WhereFilterList = Array<WhereRelationFilter>;

export enum filtersTypes {
  boolean = "boolean",
  string = "string",
  numeric = "number",
  ipV4 = "IPv4",
  freeSearch = "freeSearch"
}
export const defaultFilterType = filtersTypes.string;

/* filters operators */
export namespace typeOperators {
  export enum operators {
    not = "!",
    eq = "=",
    ne = "!=",
    like = "~",
    unlike = "!~",
    regex = "regex",
    regexnot = "!regex",
    gt = ">",
    gte = ">=",
    lt = "<",
    lte = "<=",
    inrange = "<>"
  }

  export enum booleanOperators {
    eq = operators.eq,
    ne = operators.ne
  }
  export enum numericOperators {
    eq = operators.eq,
    ne = operators.ne,
    gt = operators.gt,
    gte = operators.gte,
    lt = operators.lt,
    lte = operators.lte,
    inrange = operators.inrange
  }
  export enum stringOperators {
    eq = operators.eq,
    ne = operators.ne,
    like = operators.like,
    unlike = operators.unlike,
    regex = operators.regex
  }

  export enum ipV4Operators {
    eq = operators.eq,
    ne = operators.ne,
    gt = operators.gt,
    gte = operators.gte,
    lt = operators.lt,
    lte = operators.lte,
    inrange = operators.inrange,
    regex = operators.regex
  }

  export enum freeSearhOperators {
    eq = operators.eq,
    ne = operators.ne,
    regex = operators.regex,
    regexnot = operators.regexnot
  }
}
