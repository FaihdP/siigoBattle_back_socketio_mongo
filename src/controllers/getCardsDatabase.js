import Card from "../../database/Card.js"

export default async function getCardsDatabase(usersMap) {
  const allCodes = Array.from(usersMap.values()).reduce((codes, player) => {
    codes.push(...player.cards);
    return codes;
  }, []);

  const cardsInformation = await Card.find({ code: { $in: allCodes } });

  const cardsMap = cardsInformation.reduce((map, card) => {
    map[card.code] = card;
    return map;
  }, {});

  for (const [key, player] of usersMap) {
    player.cards = player.cards.map((code) => cardsMap[code]);
  }
}