import "jest";
import { LinkedList, LinkedListNode } from "../../src/structure";

// test tow direction linked list
describe("LinkedList", () => {
  let list: LinkedList;

  beforeEach(() => {
    list = new LinkedList();
  });

  test("Add to list head", () => {
    list
      .addToHead(new LinkedListNode("1"))
      .addToHead(new LinkedListNode("2"))
      .addToHead(new LinkedListNode("3"));

    expect(list.head.value).toBe("3");
    expect(list.head.next.value).toBe("2");
    expect(list.tall.value).toBe("1");

    expect(list.length).toBe(3);
  });

  test("Add to list tall", () => {
    list
      .addToTall(new LinkedListNode("1"))
      .addToTall(new LinkedListNode("2"))
      .addToTall(new LinkedListNode("3"));

    expect(list.tall.value).toBe("3");
    expect(list.tall.previous.value).toBe("2");
    expect(list.head.value).toBe("1");
    expect(list.length).toBe(3);
  });

  test("Remove from list head", () => {
    list
      .addToTall(new LinkedListNode("1"))
      .addToTall(new LinkedListNode("2"))
      .addToTall(new LinkedListNode("3"))
      .removeFromHead();

    expect(list.tall.value).toBe("3");
    expect(list.head.value).toBe("2");
    expect(list.length).toBe(2);
  });

  test("Remove from list tall", () => {
    list
      .addToTall(new LinkedListNode("1"))
      .addToTall(new LinkedListNode("2"))
      .addToTall(new LinkedListNode("3"))
      .removeFromTall();

    expect(list.tall.value).toBe("2");
    expect(list.head.value).toBe("1");
    expect(list.length).toBe(2);
  });

  test("Remove from the middle", () => {
    const middleNode = new LinkedListNode("2");
    list
      .addToTall(new LinkedListNode("1"))
      .addToTall(middleNode)
      .addToTall(new LinkedListNode("3"))
      .remove(middleNode);

    expect(list.tall.value).toBe("3");
    expect(list.head.value).toBe("1");
    expect(list.length).toBe(2);
  });

  test("Remove one by removeFromTall", () => {
    list.addToTall(new LinkedListNode("1")).removeFromTall();

    expect(list.head).toBe(null);
    expect(list.tall).toBe(null);
    expect(list.length).toBe(0);
  });

  test("Remove one by removeFromHead", () => {
    list.addToTall(new LinkedListNode("1")).removeFromHead();

    expect(list.head).toBe(null);
    expect(list.tall).toBe(null);
    expect(list.length).toBe(0);
  });

  test("Test find", () => {
    list
      .addToTall(new LinkedListNode("1"))
      .addToTall(new LinkedListNode("2"))
      .addToTall(new LinkedListNode("3"));

    expect(list.findByValue("2")?.value).toBe("2");
  });

  test("Test find with compere function", () => {
    const list = new LinkedList<{ value: String }>();

    list
      .addToTall(new LinkedListNode({ value: "1" }))
      .addToTall(new LinkedListNode({ value: "2" }))
      .addToTall(new LinkedListNode({ value: "3" }));

    expect(
      list.findByValue({ value: "2" }, (v1, v2) => v1.value == v2.value)?.value
    ).toEqual({ value: "2" });
  });
});
