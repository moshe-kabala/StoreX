import { csvTransform } from "./transform/csv.trans";
import { flatKeys } from "@storex/utils/lib/schema";
import { createCollection, CollectionOptions } from "./collection";
import { runQuery, FuncOpts } from "./filter";



const deviceTypeOptions = [
  "HMI",
  "PLC",
  "SERVER"
]


const schema = {
  type: "object",
  properties: {
    id: { type: "number", title: "ID" },
    name: {
      type: "string",
      title: "Name"
    },
    ip: {
      type: "number",
      title: "IP"
    },
    point: {
      type: "object",
      properties: {
        x: { type: "number" },
        y: { type: "number" }
      }
    },
    type: {
      type: "string", title: "Type", enum: deviceTypeOptions
    }
  }
}



function createMockDevices() {
  const devices = [];
  for (let i = 0; i < 200; i++) {
    devices.push({
      id: i,
      name: "device" + i,
      ip: getRandomIp(),
      point: {
        x: random(0, 100),
        y: random(0, 100)
      },
      create_time: (Date.now() / 1000) + i * 60 * 60 * 12,
      type: deviceTypeOptions[random(0, deviceTypeOptions.length)]
    })
  }
  return devices
}


function random(min, max) {
  const range = max - min
  return Math.floor(range * Math.random() + min);
}

function getRandomIp() {
  return `${random(0, 255)}.${random(0, 255)}.${random(0, 255)}.${random(0, 255)}`
}

function main() {
  const devices = createMockDevices()

  const count = deviceTypeOptions.reduce((o, type) => { o[type] = getCount(devices, type); return o }, {})


  const { data, schema: sche } = runQuery(devices, {
      schema,
      columns: [
          { key: "x", path: "point", alias: "X" },
          { key: "y", path: "point" },
          { key: "name" },
          { key: "type", alias: "T" },
      ]
  })
 }
function getCount(devices, type) {
  return devices.reduce((n, i) => {
    return i.type == type ? ++n : n;
  }, 0)
}

main();

