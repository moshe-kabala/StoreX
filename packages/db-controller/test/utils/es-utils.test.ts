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

    esutils.injectTimeIntervalToAggSchema(aggSchema, interval);
    console.log("aggSchema: ", aggSchema);
    console.log("expectedSchema: ", expectedSchema);
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
    expectedSchema2.somefield.date_histogram.calendar_interval = interval;

    esutils.injectTimeIntervalToAggSchema(aggSchema2, interval);
    expect(aggSchema2).toEqual(expectedSchema2);

    const aggSchema3 = {
      somefield: [
        {
          date_histogram: {
            field: "start_time",
            calendar_interval: "1m"
          }
        }
      ]
    };

    const expectedSchema3 = JSON.parse(JSON.stringify(aggSchema3));
    expectedSchema3.somefield[0].date_histogram.calendar_interval = interval;

    esutils.injectTimeIntervalToAggSchema(aggSchema3, interval);
    expect(aggSchema3).toEqual(expectedSchema3);

    const aggSchema4 = {
      somefield: [
        {
          date_histogram: {
            field: "start_time",
            calendar_interval: "1m"
          }
        },
        {
          date_histogram: {
            field: "start_time",
            calendar_interval: "1m"
          }
        }
      ]
    };

    const expectedSchema4 = JSON.parse(JSON.stringify(aggSchema4));
    expectedSchema4.somefield[0].date_histogram.calendar_interval = interval;
    expectedSchema4.somefield[1].date_histogram.calendar_interval = interval;

    esutils.injectTimeIntervalToAggSchema(aggSchema4, interval);
    expect(aggSchema4).toEqual(expectedSchema4);

    const aggSchema5 = {
      somefield: [
        {
          somefiled2: {
            date_histogram: {
              field: "start_time",
              calendar_interval: "1m"
            }
          }
        },
        {
          somefield3: [
            {
              date_histogram: {
                field: "start_time",
                calendar_interval: "1m"
              }
            }
          ]
        }
      ]
    };

    const expectedSchema5 = JSON.parse(JSON.stringify(aggSchema5));
    expectedSchema5.somefield[0].somefiled2.date_histogram.calendar_interval = interval;
    expectedSchema5.somefield[1].somefield3[0].date_histogram.calendar_interval = interval;

    esutils.injectTimeIntervalToAggSchema(aggSchema5, interval);
    expect(aggSchema5).toEqual(expectedSchema5);
  });
});
