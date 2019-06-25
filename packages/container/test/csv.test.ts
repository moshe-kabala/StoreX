import "jest";
import {csvTransform}  from "../../container/src/transform/csv.trans";

describe("Csv", () => {
  
const dataObject = [
  {
    meta: {
      modification_time: 1547127985.394509,
      modifier: "System",
      namespace: "from-traffic"
    }
  }
];

const dataLongString = [
  {
    rule: "alert tcp $EXTERNAL_NET any -> $SIP_SERVERS $SIP_PORTS (msg:PROTOCOL-VOIP INVITE flood; flow:to_server,established,only_stream; sip_method:invite; detection_filter:track by_src, count 100, seconds 25; reference:cve,2008-5180; reference:url,www.ietf.org/rfc/rfc3261.txt; classtype:attempted-dos; sid:20397; rev:4;)"
  }
];
const schemaObject = {
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

const schemaLongString = {
  type: "object",
  properties: {
    rule: {
      title: "rule",
      type:"string"
    }
  }
};

  test("StringifyObject", async () => {
    const res = await csvTransform(dataObject,  schemaObject );
    expect(res).toEqual(`"Details"\n"Modification Time: 1547127985.394509\nModifier: System\nNamespace: from-traffic"`)
  });

  test("CyberAttackTable", async () => {
    const res = await csvTransform(dataLongString,  schemaLongString );
    expect(res).toEqual("\"rule\"\n\"alert tcp $EXTERNAL_NET any -> $SIP_SERVERS $SIP_PORTS (msg:PROTOCOL-VOIP INVITE flood; flow:to_server,established,only_stream; sip_method:invite; detection_filter:track by_src, count 100, seconds 25; reference:cve,2008-5180; reference:url,www.ietf.org/rfc/rfc3261.txt; classtype:attempted-dos; sid:20397; rev:4;)\"")
  });
    
})