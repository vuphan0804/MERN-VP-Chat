require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const http = require("http");
const morgan = require("morgan");

const userModel = require("./models/userModel");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(morgan("dev"));

// Routes
app.use("/user", require("./routes/userRoute"));
app.use("/api", require("./routes/upload"));
app.use("/api", require("./routes/conversationRoute"));
app.use("/api", require("./routes/messageRoute"));

// SocketIO:
let socketUsers = [];

const addSocketUser = async (userId, socketId) => {
  !socketUsers.some((user) => user.userId === userId) &&
    userId &&
    socketId &&
    socketUsers.push({
      userId,
      socketId,
    });

  await userModel.updateOne({ _id: userId }, { is_online: true });
  // console.log(socketUsers);
};

const removeSocketUserBySocketId = async (socketId) => {
  const user = socketUsers.find((user) => user.socketId === socketId);
  user &&
    (await userModel.updateOne({ _id: user.userId }, { is_online: false }));

  socketUsers = socketUsers.filter((user) => user.socketId !== socketId);
  // console.log(socketUsers);
};

const findSocketIdByUserId = (userId) => {
  const user = socketUsers.find((user) => user.userId === userId);
  return user ? user.socketId : null;
};

const findUserIdBySocketId = (socketId) => {
  const user = socketUsers.find((user) => user.socketId === socketId);
  return user ? user.userId : null;
};

io.on("connection", (socket) => {
  // connection:
  socket.on("user-connected", (data) => {
    // console.log("user-connected", socket.id, data);
    addSocketUser(data.userId, socket.id);
    io.emit("online-user", { users: socketUsers });
    io.emit("new-online-user", { userId: data.userId });
    io.emit("new-online-socket", socket.id);
  });

  // disconnection:
  socket.on("disconnect", () => {
    // console.log("disconnect", socket.id);
    removeSocketUserBySocketId(socket.id);
    io.emit("online-user", { users: socketUsers });
    io.emit("new-offline-user", { userId: findUserIdBySocketId(socket.id) });
    io.emit("new-offline-socket", socket.id);
  });

  // send message:
  socket.on("new-message", (data) => {
    const { receiverId, message } = data;
    const receiverSocketId = findSocketIdByUserId(receiverId);
    if (receiverSocketId)
      io.to(receiverSocketId).emit("new-message", { message });
  });

  // new group conversation:
  socket.on("new-group-conversation", (data) => {
    const { groupMembers, conversationId } = data;
    groupMembers.map((userId) => {
      const userSocketId = findSocketIdByUserId(userId);
      io.to(userSocketId).emit("new-group-conversation", { conversationId });
    });
  });

  // calling:
  socket.on("call-user", (data) => {
    const receivingSocketId = findSocketIdByUserId(data.userToCall);
    if (receivingSocketId) {
      io.to(receivingSocketId).emit("call-user", {
        from: data.from,
        userId: data.userId,
        name: data.name,
        avatar: data.avatar,
        callType: data.callType,
        signalData: data.signalData,
      });
    }
  });

  // gr calling:
  socket.on("gr-call-user", (data) => {
    data.conversation.members.forEach((mem) => {
      const receivingSocketId = findSocketIdByUserId(mem._id);
      if (receivingSocketId) {
        io.to(receivingSocketId).emit("gr-call-user", {
          from: data.from,
          userId: data.userId,
          name: data.name,
          avatar: data.avatar,
          callType: data.callType,
          signalData: data.signalData,
          conversation: data.conversation,
        });
      }
    });
  });

  // accepting call:
  socket.on("call-accepted", (data) => {
    // console.log("call-accepted");
    if (data.to) {
      const socketId = findSocketIdByUserId(data.to);
      socketId && io.to(socketId).emit("call-accepted", data);
    }
  });

  // gr accepting call:
  socket.on("gr-call-accepted", (data) => {
    // console.log("gr-call-accepted");
    if (data.conversation.members) {
      const userId = findUserIdBySocketId(socket.id);
      const otherMems = data.conversation.members.filter(
        (mem) => mem._id !== userId
      );
      const joiner = data.conversation.members.find(
        (mem) => mem._id === userId
      );
      otherMems.forEach((mem) => {
        const socketId = findSocketIdByUserId(mem._id);
        socketId &&
          io
            .to(socketId)
            .emit("gr-call-accepted", {
              ...data,
              joinerName: joiner.name,
              joinerAvatar: joiner.avatar,
            });
      });
    }
  });

  // ending call:
  socket.on("end-call", (data) => {
    if (data.partner) {
      const socketId = findSocketIdByUserId(data.partner);
      socketId && io.to(socketId).emit("end-call");
    }
  });

  // gr ending call:
  socket.on("gr-end-call", (data) => {
    if (data.conversation.members) {
      const userId = findUserIdBySocketId(socket.id);
      const otherMems = data.conversation.members.filter(
        (mem) => mem._id !== userId
      );
      const leaver = data.conversation.members.find(
        (mem) => mem._id === userId
      );
      otherMems.forEach((mem) => {
        const socketId = findSocketIdByUserId(mem._id);
        socketId &&
          io
            .to(socketId)
            .emit("gr-end-call", { ...data, leaverName: leaver.name });
      });
    }
  });
});

// Connect to mongodb
const URI = process.env.MONGODB_URL;
mongoose.connect(
  URI,
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("Connected to mongodb");
  }
);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
