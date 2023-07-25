import Card from "../database/Card.js"

export default async function getCards(players) {
  for (const player of players) {
    const cards = player.cards
    player.cards = []
    for (const code of cards) {
      const cardInformation = await Card.findOne({ code: code})
      player.cards.push(cardInformation)
    }
  }
}