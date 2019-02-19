import * as mysql from "mysql";
import { FilterData } from "./../filter-data";

export interface FilterDataSqlArgs {
  limitResults?;
  filterData?;
  fields;
  fieldDate?;
  fromTable;
  whereIgnore?;
  moreWhere?;
  getDB: () => object;
  filterDataValidation?;
}

export class FilterDataSql extends FilterData {
  query;
  filterData;
  fields;
  fieldDate;
  fromTable;
  whereIgnore;
  moreWhere;
  getDB;
  filterDataValidation;

  constructor(args: FilterDataSqlArgs) {
    //filterData, fields, from, fieldForTime, whereIgnore  ){
    super(args.fieldDate, args.filterDataValidation);

    this.query = "";
    this.filterData = args.filterData;
    this.fields = args.fields;
    this.fieldDate = args.fieldDate;
    this.fromTable = args.fromTable;
    this.whereIgnore = args.whereIgnore;
    this.moreWhere = args.moreWhere;
    this.getDB = args.getDB;
    this.filterDataValidation = args.filterDataValidation;
  }

  validFilterData() {
    this.filterDataValidation(this.filterData);
    return this.filterDataValidation.errors;
  }

  buildQuery() {
    this.addFields()
      .addFrom()
      .addWhere()
      .addOrderBy()
      .addLimit();
    return this.query;
  }

  buildCountQuery() {
    this.addFields()
      .addFrom()
      .addWhere();
    return `select count(*) as row_num from ( ${this.query} ) Results`;
  }

  addFields() {
    this.query = `select ${this.getFields()} `;
    return this;
  }

  getFields() {
    return this.fields.join(", ");
  }

  addOrderBy() {
    this.query += `${this.getOrderBy()} \n`;
    return this;
  }

  get isLimit() {
    return !(
      !this.filterData.page ||
      this.filterData.page === 0 ||
      !this.filterData.itemsPerPage ||
      this.filterData.itemsPerPage === 0
    );
  }

  getOrderBy() {
    var sort = this.filterData["sort"];

    if (!sort || !sort.length) {
      return "";
    }

    var orderBy = "\nORDER BY\n";
    orderBy += sort
      .map(function(elem) {
        var direction = "asc";
        if (elem.reverse) direction = "desc";
        return elem.key + " " + direction;
      })
      .join(",\n");
    return orderBy;
  }

  addFrom() {
    this.query += `from ${this.fromTable} \n`;
    return this;
  }

  addLimit() {
    this.query += `${this.getLimit()} \n`;
    return this;
  }

  getLimit() {
    if (!this.isLimit) {
      return "";
    }
    return (
      "LIMIT " +
      (this.filterData.page - 1) * this.filterData.itemsPerPage +
      "," +
      this.filterData.itemsPerPage
    );
  }

  addWhere() {
    this.query += this.getWhere(this.moreWhere, this.whereIgnore);
    return this;
  }

  getWhere(moreWhere = "", ignoreFields) {
    // limit the range of event
    var whereBefore = moreWhere != "";
    let rangeWhere = createWhereRange(
      this.filterData.from,
      this.filterData.to,
      this.fieldDate
    );
    if (rangeWhere != "")
      moreWhere += ` ${whereBefore ? "and" : ""} ${rangeWhere}`;

    let where = this.filterData.where;
    return createSqlWhere(where, moreWhere, ignoreFields);
  }

  fetchFilteredData() {
    var self = this;
    return new Promise((resolve, reject) => {
      var query = self.buildQuery();

      if (this.isLimit) {
        var count_query = self.buildCountQuery();
        self.getDB().query(count_query, function(error, rows) {
          if (error) return reject(new Error("Can't execute count query"));

          var numberOfRows = rows[0]["row_num"];
          getResult(numberOfRows);
        });
      } else {
        getResult();
      }

      function getResult(numberOfRows?) {
        self.getDB().query(query, function(error, rows) {
          if (error) {
            console.error("[filterDataSql::limit query]", error);
            return reject(new Error("Can't execute limits Query"));
          }

          var output = {};
          if (numberOfRows != undefined) {
            output["length"] = numberOfRows;
            output["data"] = rows;
          } else {
            output = rows;
          }
          resolve(output);
        });
      }
    });
  }
}

export function createWhereRange(from, to, fieldDate) {
  let whereBefore = false;
  let where = "";
  if (from) {
    where += `${fieldDate} >= ${timestampToSecond(from)}`;
    whereBefore = true;
  }
  if (to)
    where += ` ${whereBefore ? "and" : ""} ${fieldDate} < ${timestampToSecond(
      to
    )}`;
  return where;
}

export function createSqlWhere(where, moreWhere = "", ignoreFields) {
  var translatedQuery = "";

  var isHasAtLeastOneWhere;
  if (!where) {
    return moreWhere || "";
  }
  if (where.length === 0 && moreWhere === "") return "";
  else {
    translatedQuery += " \n" + "WHERE " + "\n";

    for (var i = 0; i < where.length; i++) {
      if (where[i].key !== "" && where[i].value !== "") {
        let key = where[i].key,
          val = where[i].value,
          type = where[i].type,
          operator = where[i].operator;

        if (ifEmptyVal(val)) continue;

        if (ignoreFields && ignoreFields.indexOf(key) != -1) continue;

        if (isHasAtLeastOneWhere) translatedQuery += " and \n";

        translatedQuery += createWhereWithLike(key, val, type, operator);
        isHasAtLeastOneWhere = true;
      }
    }
  }
  if (moreWhere) {
    if (isHasAtLeastOneWhere) translatedQuery += " and \n";

    translatedQuery += moreWhere;
  }
  translatedQuery += " \n";

  if (moreWhere || isHasAtLeastOneWhere) return translatedQuery;
  return "";
}

function createWhereWithLike(column, value, type = "string", operator = "=") {
  if (type === "string" && (operator === "~" || operator === "!~")) {
    operator = operator === "~" ? "LIKE" : "NOT LIKE";
    return `CAST(${column} as char)  ${operator} "%${value}%"`;
  } else {
    if (operator === "!" || operator === "!~") {
      operator = "<>";
    } else if (operator === "~") {
      operator = "=";
    }
    if (type === "array" && value instanceof Array) {
      const arr = [];
      for (let element in value) {
        arr.push(`${column} ${operator} "${value[element]}"`);
      }
      return arr.join(" OR ");
    }
    return `${column} ${operator} ${mysql.escape(value)}`;
  }
}

export function timestampToSecond(time) {
  if (time.toString().length === 13) return time / 1000;
  return time;
}

function ifEmptyVal(val) {
  return (
    val === undefined ||
    val === "" ||
    (val instanceof Array && val.length === 0)
  );
}
