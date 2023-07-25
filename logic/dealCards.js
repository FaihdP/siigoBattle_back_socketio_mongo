export default function dealCards(players) {
  // Generate the cards in random position
  function generateRandomCards() {
    let array = [];
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 8; j++) {
        array.push(`${i + 1}${letters[j]}`);
      }
    }
    array.sort(() => Math.random() - 0.5);
    return array;
  }

  const numberPlayers = players.length;
  const cardsPerPlayer = Math.floor(32 / numberPlayers);
  const randomCards = generateRandomCards();

  // Deal the cards to players
  let k = 0;
  players.forEach((player) => {
    for (let j = 0; j < cardsPerPlayer; j++) {
      player.cards.push(randomCards[k]);
      k++;
    }
  });
}
