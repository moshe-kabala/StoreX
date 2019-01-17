import "jest";
import {csvTransform}  from "../../container/src/transform/csv.trans";

describe("Csv", () => {
  
  // test("only string table", async () => {
  //   const res = await csvTransform([{ name:"Bob" }],{properties: {key:"name", title:"Name"}} );
  //   expect(res).toEqual(`"Name"\n"Bob"`)
  // }); 
  

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
      modification_time: { type: "number", title: "Modification time" },
      modifier: { type: "string", title: "Modifier"},
      namespace: { type: "string", title: "Namespace" }
    }
  }
};

  test("PolicyMonitorTable", async () => {
    const res = await csvTransform(data,  schema );
    expect(res).toEqual(`"Details"\n"Modification Time: 1547127985.394509\r\nModifier: System\r\nNamespace: from-traffic"`)
  });
    
})