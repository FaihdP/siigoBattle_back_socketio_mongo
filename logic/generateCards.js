export default function generateCards() {
  let array = [];
  const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 8; j++) {
      array.push(`${i + 1}${letters[j]}`);
    }
  }
  return array;
}