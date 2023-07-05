import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import dealCards from "./logic/dealCards.js";
import app from "./index.js";
import { v4 as uuidv4 } from "uuid";

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
   */
  function uniqueMessage(event, message) {
    socket.join(socketId);
    io.to(socketId).emit(event, message);
    socket.leave(socketId)
  }

  socket.on("client: newUser", () => {
    uniqueMessage("server: codeConnection", uuidv4())
  })

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


  socket.on("client: tryConnectParty", (user) => {
    let userAllowed = false;
    rooms.forEach(({ room, users }) => {
      if (room === user.codeRoom && users.length < 7) {
        users.push(user);
        usersRoom = users;
        userAllowed = true;
      }
    });

    uniqueMessage("server: stateConnection", userAllowed)

    if (userAllowed) {
      socket.join(user.codeRoom);
      io.to(user.codeRoom).emit("server: updateUsersRoom", usersRoom);
    }
  });


  socket.on("client: getUsersRoom", (codeRoom = null) => {
    uniqueMessage("server: updateUsersRoom", usersRoom)
    if (codeRoom) socket.join(codeRoom);
  });


  socket.on("client: startParty", (codeRoom) => {
    dealCards(usersRoom);
    
    io.to(codeRoom).emit("server: startParty");
  });


  socket.on("client: getUsersCards", (codeRoom) => {
    uniqueMessage("server: updateUsersCards", usersRoom);
    if (codeRoom) socket.join(codeRoom);
  });


  socket.on("client: reconnectRoom", (codeRoom) => {
    socket.join(codeRoom);
  });


  socket.on("client: userDisconnect", () => {
    console.log("User disconnect");
  });
});
