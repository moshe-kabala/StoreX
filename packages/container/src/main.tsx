import { csvTransform } from "./transform/csv.trans";
import { flatKeys } from "@storex/utils/lib/schema";
import { createCollection, CollectionOptions } from "./collection";



const deviceTypeOptions = [
  "HMI",
  "PLC",
  "SERVER"
]


const schema = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: {
      type: "string"
    },
    ip: {
      type: "number"
    },
    type: {
      type: "string", enum: deviceTypeOptions
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

async function main() {
  const fields = flatKeys(schema)
  console.log("fields", fields)
  const collOpt = new CollectionOptions({
    fields
  })

  let coll = createCollection({ itemToId: (i) => i.id, options: collOpt });
  const devices = createMockDevices();

  coll.data = devices;

  const opt = await coll.getOptions({ key: "type" });
  console.log("options", opt);
}

main();
