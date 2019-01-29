import { runQuery, FuncOpts } from "../../src/filter"


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
        create_time: {
            title: "Created",
            type: "number",
            role: "date"
        },
        type: {
            type: "string", title: "Type", enum: deviceTypeOptions
        }
    }
}


describe("test group and divided by cache", () => {

    test("group by", async () => {


        const devices = createMockDevices()

        const count = deviceTypeOptions.reduce((o, type) => { o[type] = getCount(devices, type); return o }, {})


        const { data, schema: schm } = runQuery(devices, {
            schema,
            group: {
                key: "type",
            }
        })

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
                }
            }
        })
        expect(resultCount).toEqual(count)
    })

    test("group by - aggregated fields", async () => {

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
        expect(resultCount).toEqual(count)

    })

    test("group by (with date range)", async () => {


        const devices = createMockDevices()

        const count = deviceTypeOptions.reduce((o, type) => { o[type] = getCount(devices, type); return o }, {})


        const { data, schema: schm } = runQuery(devices, {
            schema,
            group: {
                key: "create_time",
                range: 24 * 60 * 60
            }
        })


        const resultCount = data.reduce((o, i) => { o[i.key] = i.count; return o }, {})

        // check the schema
        expect(schm).toEqual({
            type: "object",
            properties: {
                key: {
                    title: "Created",
                    type: "number",
                    role: "date"
                },
                count: {
                    type: "number"
                }
            }
        })
        // expect(resultCount).toEqual(count)
    })

    test("divided by", async () => {

        const devices = createMockDevices()

        const count = deviceTypeOptions.reduce((o, type) => { o[type] = getCount(devices, type); return o }, {})


        const { data } = runQuery(devices, {
            schema,
            divided: {
                key: "type",
            }
        })

        const resultCount = data.reduce((o, i) => { o[i.key] = i.value.length; return o }, {})
        expect(resultCount).toEqual(count)
    })

    test("check column and schema", async () => {

        const devices = createMockDevices()

        const count = deviceTypeOptions.reduce((o, type) => { o[type] = getCount(devices, type); return o }, {})


        const { data, schema: sche } = runQuery(devices, {
            schema,
            columns: [
                { key: "x", path: "point", alias: "X" },
                { key: "y", path: "point" },
                { key: "name" },
                { key: "type", alias: "T" },
            ]
        })

        expect(sche).toEqual({
            type: "object",
            properties: {
                "point.x": { type: "number", title: "X" },
                "point.y": { type: "number", title: "y" },
                name: {
                    type: "string",
                    title: "Name"
                },

                type: {
                    type: "string", title: "T", enum: deviceTypeOptions
                }
            }
        })
        // todo
        // expect(resultCount).toEqual(count)
    })

})

function getCount(devices, type) {
    return devices.reduce((n, i) => {
        return i.type == type ? ++n : n;
    }, 0)
}


function createMockDevices() {
    const devices = [];
    for (let i = 0; i < 200; i++) {
        devices.push({
            id: i,
            name: "device" + i,
            ip: getRandomIp(),
            point: {
                x: random(0, 100),
                y: random(0, 100)
            },
            create_time: (Date.now() / 1000) + i * 60 * 60 * 12,
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