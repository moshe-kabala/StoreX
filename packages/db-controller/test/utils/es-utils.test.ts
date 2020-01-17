import "jest";
import { esutils } from "./../../src/utils/es/util";

describe("elasticsearch utils tests", () => {
  test("test time interval injection to aggregation schema", async () => {
    const interval = "some interval";
    const aggSchema = {
      date_histogram: {
        field: "start_time",
        calendar_interval: "1m"
      }
    };

    const expectedSchema = JSON.parse(JSON.stringify(aggSchema));
    expectedSchema.date_histogram.calendar_interval = interval;

    const newSchema = esutils.injectTimeIntervalToAggSchema(
      aggSchema,
      interval
    );
    expect(aggSchema).toEqual(expectedSchema);

    const aggSchema2 = {
      somefield: {
        date_histogram: {
          field: "start_time",
          calendar_interval: "1m"
        }
      }
    };

    const expectedSchema2 = JSON.parse(JSON.stringify(aggSchema2));
    expectedSchema.date_histogram.calendar_interval = interval;

    const newSchema2 = esutils.injectTimeIntervalToAggSchema(
      aggSchema,
      interval
    );
    expect(aggSchema2).toEqual(expectedSchema2);
  });
});
