import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import app from "./index.js";
import { v4 as uuidv4 } from "uuid";

import dealCards from "./logic/dealCards.js";
import getCards from "./logic/getCards.js";
import firstPlayer from "./logic/firstPlayer.js";

/** Enums */
import { RoomConnectionStatus, RoundStatus } from "../client/src/logic/enums/Enums.js";

const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:5173",
  },
  serveClient: false,
  pingInterval: 20000,
  pingTimeout: 15000,
  cookie: false,
});

server.listen(4000, () => console.log("Server on port", 4000));

let rooms = [];
let usersRoom = [];

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
   * This event means that a new room has been created, where new users can connect.
   * This creates a array with code room and the information about the user
   * @example {room: codeRoom, users: [User, ...]}
   */
  socket.on("client: newParty", (user) => {
    rooms.push({
      room: user.codeRoom,
      users: [user],
    });

    socket.join(user.codeRoom);

    usersRoom = [user];
    io.to(user.codeRoom).emit("server: updateUsersRoom", usersRoom);
  });

  /**
   * Try to connect a room, check the code of all rooms and connect the user if the code room exists.
   * If the numbers players if greater than 7, the room will close.
   * @param {User} user - The user who is trying to connect
   */
  socket.on("client: tryConnectParty", (user) => {
    let connection = { status: RoomConnectionStatus.NOT_EXISTS };
    rooms.forEach(({ room, users }) => {
      if (room === user.codeRoom) {
        if (users.length >= 7) {
          connection = { status: RoomConnectionStatus.IS_FULL };
          return;
        }

        user.entryOrder = users.length + 1;
        users.push(user);
        usersRoom = users;
        connection = {
          status: RoomConnectionStatus.SUCCESSFUL,
          playersNumber: users.length,
        };
      }
    });

    uniqueMessage("server: infoConnection", connection);

    if (connection.status === RoomConnectionStatus.SUCCESSFUL) {
      socket.join(user.codeRoom);
      io.to(user.codeRoom).emit("server: updateUsersRoom", usersRoom);
    }
  });

  /**
   * Send a update of users in the room.
   * @param {String} codeRoom - The code room of the user
   */
  socket.on("client: getUsersRoom", (codeRoom) => {
    uniqueMessage("server: updateUsersRoom", usersRoom, codeRoom);
  });

  /**
   * When the party owner starts the party, cards are dealt, cards from the database are brought in
   * and an event is sent to all players in the room
   * @param {String} codeRoom - The code room of the user
   */
  socket.on("client: startParty", async (codeRoom) => {
    try {
      await dealCards(usersRoom);
      await getCards(usersRoom);
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
    const player = firstPlayer(usersRoom)
    io.to(codeRoom).emit("server: chooserUser", player.id);
  });

  /**
   * Get the last user card
   * @param {String} userId - The user id
   */
  socket.on("client: getCard", (userId) => {
    const user = usersRoom.find((user) => user.id === userId);
    let card = null;
    if (user) card = user.cards[user.cards.length - 1];
    uniqueMessage("server: updateCard", card, user?.codeRoom);
  });

  /**
   * Delete the last user card
   * @param {String} userId - The user id
   */
  socket.on("client: nextCard", (userId) => {
    const user = usersRoom.find((userRoom) => userRoom.id === userId);
    user.cards.pop();
    uniqueMessage("client: nextCard-finish", null, user.codeRoom);
  });

  /**
   * Get the winner player in the round and who is the next player will choose in the next round
   * @param {String} feature - The feature choosed
   * @param {String} userId - The user id
   */
  socket.on("client: choosedFeature", ({ feature, userId }) => {
    let user = usersRoom.find((user) => user.id === userId);
    let message = { status: RoundStatus.PLAYER_WON, user };
    let greaterFeature = user.cards[user.cards.length - 1][feature];
    let cardsWon = [user.cards[user.cards.length - 1]];

    for (const userRoom of usersRoom) {
      if (user.id === userRoom.id) continue

      cardsWon.push(userRoom.cards[user.cards.length - 1]);

      const valueFeature = userRoom.cards[user.cards.length - 1][feature];

      if (valueFeature === greaterFeature) {
        message.status = RoundStatus.DRAW
        break;
      }
      
      if (valueFeature > greaterFeature) {
        message.user = userRoom;
        greaterFeature = valueFeature;
      }
    }

    if (message.status !== RoundStatus.DRAW) user.cardsWon = cardsWon

    let nextUser = usersRoom.find((userRoom) => user.entryOrder < userRoom.entryOrder);
    if (!nextUser) nextUser = usersRoom[0]
    
    io.to(user.codeRoom).emit("server: chooserUser", nextUser.id);
    io.to(user.codeRoom).emit("server: winnerRound", message);
  });

  //socket.on("disconnect", (reason) => {
  //  console.log("User disconnect, because:", reason);
  //});
});
