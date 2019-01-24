import { runQuery } from "../../src/filter"


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
        type: {
            type: "string", title: "Type", enum: deviceTypeOptions
        }
    }
}


describe("test group and divided by cache", () => {

    test("group by", async () => {


        const devices = createMockDevices()

        const count = deviceTypeOptions.reduce((o, type) => { o[type] = getCount(devices, type); return o }, {})


        const { data } = runQuery(devices, {
            schema,
            group: {
                key: "type",
            }
        })


        const resultCount = data.reduce((o, i) => { o[i.key] = i.count; return o }, {})
        expect(resultCount).toEqual(count)
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