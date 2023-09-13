import generateCards from "./generateCards.js";
import Card from "../../database/Card.js";

export default async function dealCards(usersMap) {
  const numberPlayers = usersMap.size;
  const numberCards = await Card.countDocuments({})
  const cardsPerPlayer = Math.floor(numberCards / numberPlayers);
  
  // Generate the cards in random position
  const randomCards = generateCards().sort(() => Math.random() - 0.5);

  // Save the cards size in memory
  usersMap.forEach((player) => {
    player.cards.length = cardsPerPlayer;
  });

  // Deal the cards to players
  let k = 0;
  usersMap.forEach((player) => {
    for (let j = 0; j < cardsPerPlayer; j++) {
      player.cards[j] = randomCards[k];
      k++;
    }
  });
}
