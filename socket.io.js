import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import dealCards from "./logic/dealCards.js";
import app from "./index.js";
import { v4 as uuidv4 } from "uuid";
import getCards from "./logic/getCards.js";

/** Enums */
import RoomConnectionStatus from "../client/src/logic/enums/RoomConnectionStatus.js";

const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:5173",
  },
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

        users.push(user);
        usersRoom = users;
        connection = {
          status: RoomConnectionStatus.SUCCESSFUL,
          playersNumber: usersRoom.length,
        };
      }
    });

    uniqueMessage("server: infoConnection", connection);

    if (connection.status === RoomConnectionStatus.SUCCESSFUL) {
      socket.join(user.codeRoom);
      io.to(user.codeRoom).emit("server: updateUsersRoom", usersRoom);
    }
  });

  socket.on("client: getUsersRoom", (codeRoom = null) => {
    uniqueMessage("server: updateUsersRoom", usersRoom);
    if (codeRoom) socket.join(codeRoom);
  });

  socket.on("client: startParty", async (codeRoom) => {
    dealCards(usersRoom);
    await getCards(usersRoom);
    io.to(codeRoom).emit("server: startParty");
  });

  socket.on("client: getCard", async (userId) => {
    const user = usersRoom.find((user) => user.id === userId);
    let card = null;
    if (user) card = user.cards[user.cards.length - 1];
    uniqueMessage("server: updateCard", card, user?.codeRoom);
  });

  socket.on("client: nextCard", (userId) => {
    const user = usersRoom.find((userRoom) => userRoom.id === userId);
    user.cards.pop();
    uniqueMessage("client: nextCard-finish", null, user.codeRoom);
  });

  socket.on("client: reconnectRoom", (codeRoom) => {
    socket.join(codeRoom);
  });

  socket.on("client: userDisconnect", () => {
    console.log("User disconnect");
  });

});
