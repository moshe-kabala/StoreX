export namespace esutils {
  export function injectTimeIntervalToAggSchema(schema, interval) {
    console.log("injectTimeIntervalToAggSchema: schema: ", schema);
    if (typeof schema !== "object") {
      return;
    }
    if (schema["date_histogram"] !== undefined) {
      console.log("injecting interval");
      schema["date_histogram"]["calendar_interval"] = interval;
      return;
    }
    for (const key of Object.keys(schema)) {
      injectTimeIntervalToAggSchema(schema[key], interval);
    }
    return;
  }
}
