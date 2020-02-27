export class LinkedListNode<T> {
  constructor(public value: T) {}
  next: LinkedListNode<T> | null = null;
  previous: LinkedListNode<T> | null = null;
}

export class LinkedList<T = unknown> {
  head: LinkedListNode<T> | null = null;
  tall: LinkedListNode<T> | null = null;
  length: number = 0;

  addValueToHead(value: T) {
    const newNode = new LinkedListNode(value);
    newNode.next = this.head;
    this.head = newNode;
    // if there is no next, that mean that the list was empty
    if (newNode.next == null) {
      this.tall = newNode;
    }
    this.length++;
    return newNode;
  }

  addToHead(newNode: LinkedListNode<T>) {
    newNode.next = this.head;
    this.head = newNode;
    // if there is no next, that mean that the list was empty
    if (newNode.next == null) {
      this.tall = newNode;
    }
    this.length++;
    return this;
  }

  removeFromHead(): LinkedListNode<T> | null {
    if (this.length === 0) {
      return null;
    }

    const node = this.head;
    this.head = node.next;
    node.next = null;
    // if head become null we need to remove tall too
    if (this.head === null) {
      this.tall = null;
    }
    this.length--;

    return node;
  }

  addValueToTall(value: T): LinkedListNode<T> {
    const newNode = new LinkedListNode<T>(value);
    this.addToTall(newNode);
    return newNode;
  }

  addToTall(node: LinkedListNode<T>): this {
    // if the list is empty
    if (!this.tall) {
      return this.addToHead(node);
    }
    node.previous = this.tall;
    this.tall.next = node;
    this.tall = node;
    this.length++;
    return this;
  }

  removeFromTall() {
    if (this.length === 0) {
      return null;
    }

    const node = this.tall;
    this.tall = node.previous;
    node.previous = null;
    this.length--;

    // if head become null we need to remove tall too
    if (this.tall === null) {
      this.head = null;
    }

    return node;
  }

  findByValue(val): LinkedListNode<T> {
    let node = this.head;

    while (node) {
      if (node.value === val) {
        return node;
      }

      node = node.next;
    }

    return node;
  }

  remove(node: LinkedListNode<T> | null): LinkedListNode<T> | null {
    if (!node) {
      return null;
    }
    if (this.head == node && this.tall == node) {
      this.head = null;
      this.tall = null;
      this.length = 0;
      return node;
    } else if (this.head == node) {
      return this.removeFromHead();
    } else if (this.tall == node) {
      return this.removeFromTall();
    } else {
      this.length--;
      node.previous.next = node.next;
      node.previous = null;
      node.next = null;
      return node;
    }
  }

  removeValue(val: T) {
    const node = this.findByValue(val);
    this.remove(node);
  }
}
