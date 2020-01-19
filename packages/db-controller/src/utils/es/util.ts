export namespace esutils {
  export function injectTimeIntervalToAggSchema(schema, interval) {
    if (typeof schema !== "object") {
      return;
    }
    if (schema["date_histogram"] !== undefined) {
      schema["date_histogram"]["calendar_interval"] = interval;
      return;
    }
    for (const key of Object.keys(schema)) {
      injectTimeIntervalToAggSchema(schema[key], interval);
    }
    return;
  }
}
