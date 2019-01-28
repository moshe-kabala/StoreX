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


  const { data, schema: schm } = runQuery(devices, {
    schema,
    group: {
      key: "type",
      aggregated_fields: [
        {
          key: "x",
          path: "point",
          alias: "X_MAX",
          func: FuncOpts.MAX
        },
        {
          key: "y",
          path: "point",
          alias: "Y_AVG",
          func: FuncOpts.AVG
        }
      ]
    }
  })

  console.log("data", data);

  const resultCount = data.reduce((o, i) => { o[i.key] = i.count; return o }, {})

  // check the schema
  expect(schm).toEqual({
    type: "object",
    properties: {
      key: {
        type: "string",
        enum: deviceTypeOptions,
        title: "Type",
      },
      count: {
        type: "number"
      },
      [`point.x_${FuncOpts.MAX}`]: {
        title: "X_MAX",
        type: "number"
      },
      [`point.y_${FuncOpts.AVG}`]: {
        title: "Y_AVG",
        type: "number"
      }
    }
  })
}
function getCount(devices, type) {
  return devices.reduce((n, i) => {
    return i.type == type ? ++n : n;
  }, 0)
}

main();

