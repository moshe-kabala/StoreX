import "jest";
import {csvTransform}  from "../../container/src/transform/csv.trans";

describe("Csv", () => {
  
  test("only string table", async () => {
    const res = await csvTransform([{ name:"Bob" }], [{key:"name", title:"Name"}] );
    expect(res).toEqual(`"Name"\n"Bob"`)
  });
  
  
  test("CyberAttackTable", async () => {
    const res = await csvTransform({data:[{ name:"Bob", bite:"ssegro" }], length: 1}, [{key:"bite", title: "Bite"}, {key:"name", title:"Name"}] );
    expect(res).toEqual(`"Bite","Name"\n"ssegro","Bob"`)
  });
  
  test("PolicyMonitorTable", async () => {
    const res = await csvTransform({data:data, length: 1}, [{key:"meta", title: "Details"}] );
    expect(res).toEqual(`"Details"\n"modification_time: 1547127985.394509\nmodifier: System\nnamespace: from-traffic"`)
  });
  
});

const data = 
[
  {
    meta : { modification_time:1547127985.394509, modifier: "System", namespace : "from-traffic"},
  }
]
  

