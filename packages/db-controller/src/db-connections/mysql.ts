import * as mysql from "mysql";
import { Query } from "mysql";

interface ConnectionDetails {
  password: string;
  user: string;
  host: string;
  dbs: string[];
}

let mysqlConf: ConnectionDetails;

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

const DBS_POOL: { [key: string]: mysql.Pool } = {};

export function init(_mysqlConf: ConnectionDetails) {
  mysqlConf = _mysqlConf;

  for (const db of mysqlConf.dbs) {
    Object.defineProperty(DBS_POOL, db, {
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

export function connect() {
  // before connect lets close
  close();
  const { host, user, password } = mysqlConf;
  for (const db of mysqlConf.dbs) {
    connections[db] = mysql.createPool({
      connectionLimit: 15,
      host,
      user,
      password,
      database: db
    });
  }
}

export function close() {
  if (!mysqlConf) {
    throw Error(
      "[MySql::close] the db never init, please init the db before using it"
    );
  }
  for (const db of mysqlConf.dbs) {
    const dbPool = connections[db];
    if (dbPool != undefined) {
      dbPool.end();
      connections[db] = undefined;
    }
  }
}

export default DBS_POOL;
