import "jest";
import { map } from "../src/wrappers"

describe("Map", () => {

  test("Single map", async () => {
    const res = await map({ name: "Bob" }, (p) => { p.name += "2"; return p });
    expect(res).toEqual({ name: "Bob2" })
  });

  test("Single map async", async () => {
    const res = await map({ name: "Bob" }, async (p) => { p.name += "2"; return p });
    expect(res).toEqual({ name: "Bob2" })
  });

  test("Single map async", async () => {
    try {
      await map({ name: "Bob" }, async (p) => { throw Error("map failed") });
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
    }
  });

  test("Multi Items map", async () => {
    const res = await map([{ name: "Bob" }], (p) => { p.name += "2"; return p });
    expect(res).toEqual([{ name: "Bob2" }])
  });

  test("Multi map async", async () => {
    const res = await map([{ name: "Bob" }], async (p) => { p.name += "2"; return p });
    expect(res).toEqual([{ name: "Bob2" }])
  });

  test("Multi Items failed", async () => {
    // try {
    //   await map([{ name: "Bob" }], async (p) => { throw Error("map failed") });
    // } catch (err) {
    //   expect(err).toBeInstanceOf(Error)
    // }
  });
  
});

