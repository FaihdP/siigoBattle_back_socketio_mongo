import generateCards from "./generateCards.js";

export default function firstPlayer(players) {
  const cards = generateCards()

  let firstsCardsPlayers = []
  for (const player of players) {
    const [card] = player.cards.slice(-1)
    firstsCardsPlayers.push({ 
        id: player.id, 
        cardValue: cards.indexOf(card.code),
        entryOrder: player.entryOrder
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