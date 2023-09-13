import { Server as SocketServer } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import dealCards from "./controllers/dealCards.js";
import getCardsDatabase from "./controllers/getCardsDatabase.js";
import getFirstPlayer from "./controllers/getFirstPlayer.js";

/** Enums */
import {
  RoomConnectionStatus,
  RoundStatus,
} from "../../client/src/logic/enums/Enums.js";

export function initializeSocket(server) {
  const io = new SocketServer(server, {
    cors: { origin: "http://localhost:5173" },
    serveClient: false,
    pingInterval: 20000,
    pingTimeout: 15000,
    cookie: false,
  });

  let rooms = new Map();

  /**
   * Socket's event
   * @param {String} userName - Name of the user, it is saved in the front, in sessionStorage
   * @param {String} codeRoom - Code of the room where user is located, it is saved in the front, in sessionStorage
   */
  io.on("connection", (socket) => {
    const socketId = socket.id;

    /**
     * Send an event to a single user
     * @param {String} event - The event name
     * @param {*} message - The event content
     * @param {String} codeRoom - The code of the room where the user is alocated, can be null
     */
    function uniqueMessage(event, message, codeRoom = null) {
      socket.join(socketId);
      io.to(socketId).emit(event, message);   
      socket.leave(socketId);
      if (codeRoom) socket.join(codeRoom);
    }

    const convertMapToArray = (map) => (map ? Array.from(map.values()) : []);

    /**
     * Create a new user, send the uuid code to user
     */
    socket.on("client: newUser", () => {
      uniqueMessage("server: codeConnection", uuidv4());
    });

    /**
     * Connect to room again
     * @param {String} codeRoom - Room code
     */
    socket.on("client: reconnectRoom", (codeRoom) => {
      socket.join(codeRoom);
    });

    /**
     * Send a update of users in the room.
     * @param {String} codeRoom - The code room of the user
     */
    socket.on("client: getUsersRoom", (codeRoom) => {
      uniqueMessage(
        "server: setUsersRoom",
        convertMapToArray(rooms.get(codeRoom)),
        codeRoom
      );
    });

    /**
     * This event means that a new room has been created, where new users can connect.
     * This creates a array with code room and the information about the user
     * @example rooms = new Map(codeRoom, usersRoom);
     * @example userRoom = new Map(userId, new User);
     */
    socket.on("client: newParty", (user) => {
      const usersRoom = new Map().set(user.id, user);
      rooms.set(user.codeRoom, usersRoom);
      socket.join(user.codeRoom);
      io.to(user.codeRoom).emit("server: setUsersRoom", usersRoom);
    });

    /**
     * Try to connect a room, check the code of all rooms and connect the user if the code room exists.
     * If the numbers players if greater than 7, the room will close.
     * @param {User} user - The user who is trying to connect
     */
    socket.on("client: tryConnectParty", (user) => {
      const usersRoom = rooms.get(user.codeRoom);
      
      let connection = { status: RoomConnectionStatus.NOT_EXISTS };
      if (usersRoom.size > 7) {
        connection = { status: RoomConnectionStatus.IS_FULL };
        return;
      }

      user.entryOrder = usersRoom.size + 1;
      usersRoom.set(user.id, user);

      connection = {
        status: RoomConnectionStatus.SUCCESSFUL,
        playersNumber: usersRoom.size,
      };

      uniqueMessage("server: infoConnection", connection);

      if (connection.status === RoomConnectionStatus.SUCCESSFUL) {
        socket.join(user.codeRoom);
        io.to(user.codeRoom).emit(
          "server: setUsersRoom",
          convertMapToArray(usersRoom)
        );
      }
    });

    /**
     * When the party owner starts the party, cards are dealt, cards from the database are brought in
     * and an event is sent to all players in the room
     * @param {String} codeRoom - The code room of the user
     */
    socket.on("client: startParty", async (codeRoom) => {
      const usersRoom = rooms.get(codeRoom)
      try {
        await dealCards(usersRoom);
        await getCardsDatabase(usersRoom);
      } finally {
        io.to(codeRoom).emit("server: startParty");
      }
    });

    /**
     * Get first chooser in the party. The first chooser will be the player who has the card with the
     * greatest code (1A, 1B, 1C, ... 2A, 2B, ...).
     * @param {String} codeRoom - The code room of the user
     */
    socket.on("client: getFirstChooser", (codeRoom) => {
      const usersRoom = rooms.get(codeRoom);
      const player = getFirstPlayer(usersRoom);
      io.to(codeRoom).emit("server: chooserUser", player.id);
    });

    /**
     * Get the last user card
     * @param {String} userId - The user id
     */
    socket.on("client: getCards", ({ userId, codeRoom }) => {
      const usersRoom = rooms.get(codeRoom);
      const user = usersRoom.get(userId); 
      let cards = null;
      if (user) cards = user.cards;
      uniqueMessage("server: updateCards", cards, user?.codeRoom);
    });

    /**
     * Delete the specified card in amount cards of user
     * @param {String} userId - The user id
     * @param {String} cardCode - The card code to delete
     */
    socket.on("client: deleteCard", ({ userId, codeRoom, cardCode }) => {
      const usersRoom = rooms.get(codeRoom);
      const user = usersRoom.get(userId);

      if (!user) return;

      const newCards = user.cards.filter((card) => card.code !== cardCode);

      usersRoom.set(userId, { ...user, cards: newCards });

      uniqueMessage("server: updateCards", newCards, user.codeRoom);
    });

    /**
     * Get the winner player in the round and who is the next player will choose in the next round
     * @param {String} feature - The feature choosed
     * @param {String} userId - The user id
     */
    socket.on("client: choosedFeature", ({ userId, codeRoom, feature }) => {
      const usersRoom = rooms.get(codeRoom);
      const user = usersRoom.get(userId);

      let message = { status: RoundStatus.PLAYER_WON, user };
      let greaterFeature = user.cards[user.cards.length - 1][feature];
      let cardsWon = [user.card[user.cards.length - 1]];

      for (const [key, userRoom] of usersRoom) {
        if (key === userRoom.id) continue;

        cardsWon.push(userRoom.cards[user.cards.length - 1]);

        const valueFeature = userRoom.cards[user.cards.length - 1][feature];

        if (valueFeature === greaterFeature) {
          message.status = RoundStatus.DRAW;
          break;
        }

        if (valueFeature > greaterFeature) {
          message.user = userRoom;
          greaterFeature = valueFeature;
        }
      }

      if (message.status !== RoundStatus.DRAW) user.cardsWon = cardsWon;

      io.to(user.codeRoom).emit("server: winnerRound", message);

      let nextUserId = convertMapToArray(usersRoom).find((userRoom) => user.entryOrder < userRoom.entryOrder).id;
      if (!nextUserId) nextUserId = [...usersRoom.keys()][0];

      io.to(user.codeRoom).emit("server: chooserUser", nextUserId);
    });

    //socket.on("disconnect", (reason) => {
    //  console.log("User disconnect, because:", reason);
    //});
  });
}
