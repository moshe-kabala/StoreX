import * as mysql from "mysql";
import { Query } from "mysql";

let mysqlConf;

export function init(_mysqlConf) {
  mysqlConf = mysqlConf;
  for (const db of Object.keys(exportedObj)) {
    Object.defineProperty(exportedObj, db, {
      get: () => {
        if (connections[db]) {
          return connections[db];
        }
        return demoPool;
      }
    });
  }
  connect();
}

const connections: any = {};

class DemoPool {
  query = (
    query: string | mysql.QueryOptions | Query,
    func1: any,
    callback?: Function
  ): Query => {
    if (typeof func1 === "function") {
      return func1("DB not available right now", []);
    }
    if (typeof callback === "function") {
      return callback("DB not available right now", []);
    }
    return;
  };
}

const demoPool = new DemoPool();

const exportedObj: { [key: string]: mysql.Pool } = {
  ids: undefined,
  topology: undefined,
  configuration: undefined,
  management: undefined
};

export function connect() {
  // before connect lets close
  close();
  for (const db of Object.keys(exportedObj)) {
    connections[db] = mysql.createPool({
      connectionLimit: 15,
      host: mysqlConf.url,
      user: mysqlConf.user,
      password: mysqlConf.mysql_password,
      database: db
    });
  }
}

export function close() {
  for (const db of Object.keys(exportedObj)) {
    const dbPool = connections[db];
    if (dbPool != undefined) {
      dbPool.end();
      connections[db] = undefined;
    }
  }
}

export default exportedObj;
