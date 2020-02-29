import * as mysql from "mysql";
import { Query } from "mysql";

const MYSQL_DEFAULT_PORT = 3306;

// interface ConnectionSslDetails {
//   rejectUnauthorized? : boolean
//   ca?:string | string []
//   cert?:string | string [],
//   ciphers?:string,
//   clientCertEngine?:string,
//   crl?:string | string [],
//   dhparam?:string,
//   ecdhCurve?:string,
//   honorCipherOrder?:boolean,
//   key?:string | string [],
//   maxVersion?:string,
//   minVersion?:string,
//   passphrase?:string,
//   pfx?:string | string [] | Object[],
//   secureOptions?:number,
//   secureProtocol?:string,
//   sessionIdContext?:string

// }


interface ConnectionDetails extends mysql.PoolConfig {
  dbs: string[];
}

let mysqlConf:ConnectionDetails;

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
  const { dbs, ...rest } = mysqlConf;
  for (const db of dbs) {
    connections[db] = mysql.createPool({
      // default params
      connectionLimit: 15,
      port:  MYSQL_DEFAULT_PORT,
      // user config params
      ...rest,
      database: db,
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
