let idCounter = 0;

const names = ["moshe", "king", "amit", "liav"];

function createRandom(max) {
  return Math.round(Math.random() * max);
}

export function generateItem() {
  return {
    id: idCounter++,
    name: names[createRandom(names.length + 1)],
    age: createRandom(99)
  }
}

export function generateList(count = 5) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(generateItem());
  }
  return result;
}

export function itemToId(item) {
  return item.id;
}
