import { csvTransform } from "./transform/csv.trans";

const data = [
  {
    meta: {
      modification_time: 1547127985.394509,
      modifier: "System",
      namespace: "from-traffic"
    }
  }
];
const schema = {
  type: "object",
  properties: {
    meta: {
      title: "Details",
      modification_time: { type: "number", title: "Modification" },
      modifier: { type: "string" },
      namespace: { type: "string" }
    }
  }
};

const data2= {properties: {key:"name", title:"Name"}} 
const schame2= [{ name:"Bob" }]

function main() {
  const res = csvTransform(data2, schame2);
  return res
}

main();
