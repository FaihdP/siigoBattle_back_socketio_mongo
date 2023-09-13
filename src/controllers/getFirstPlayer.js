import generateCards from "./generateCards.js";

export default function getFirstPlayer(usersMap) {
  const cards = generateCards()

  let firstsCardsPlayers = []
  for (const [key, player] of usersMap) {
    const [card] = player.cards.slice(-1)
    firstsCardsPlayers.push({ 
        id: player.id, 
        cardValue: cards.indexOf(card.code),
      }
    )
  }

  // Check what is the grater card value in the array, and return the object with the user id and card value
  let greaterCardPlayer = firstsCardsPlayers[0];
  for (let i = 1; i < firstsCardsPlayers.length; i++) {
    if (firstsCardsPlayers[i].cardValue > greaterCardPlayer.cardValue) {
      greaterCardPlayer = firstsCardsPlayers[i];
    }
  }
  
  return greaterCardPlayer
}