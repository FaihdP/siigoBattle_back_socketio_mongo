import generateCards from "./generateCards.js";
import Card from "../database/Card.js";

export default async function dealCards(players) {
  const numberPlayers = players.length;
  const numberCards = await Card.countDocuments({})
  const cardsPerPlayer = Math.floor(numberCards / numberPlayers);
  
  // Generate the cards in random position
  const randomCards = generateCards().sort(() => Math.random() - 0.5);

  // Deal the cards to players
  let k = 0;
  players.forEach((player) => {
    for (let j = 0; j < cardsPerPlayer; j++) {
      player.cards.push(randomCards[k]);
      k++;
    }
  });
}
