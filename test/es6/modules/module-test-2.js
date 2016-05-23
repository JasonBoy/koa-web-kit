const a = 1;

const arr = [1, 2, 3];
const b = arr.map((ele, index) => {
  return ele * index;
});

console.log(b);

export default function Add(b) {
  return a + b;
};