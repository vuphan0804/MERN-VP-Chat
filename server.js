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
const { nextTick } = require("process");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
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
};

const removeSocketUser = async (userId) => {
  socketUsers = socketUsers.filter((user) => user.userId !== userId);

  await userModel.updateOne({ _id: userId }, { is_online: false });
};

const findSocketIdByUserId = (userId) => {
  const user = socketUsers.find((user) => user.userId === userId);

  return user ? user.socketId : null;
};

io.on("connection", (socket) => {
  // connection:
  socket.on("user-connected", (data) => {
    addSocketUser(data.userId, socket.id);
    io.emit("online-user", { users: socketUsers });
    io.emit("new-online-user", { userId: data.userId });
  });

  // send message:
  socket.on("new-message", (data) => {
    const { receiverId, message } = data;
    const receiverSocketId = findSocketIdByUserId(receiverId);
    if (receiverSocketId)
      io.to(receiverSocketId).emit("new-message", { message });
  });

  // disconnection:
  socket.on("user-disconnected", (data) => {
    removeSocketUser(data.userId);
    io.emit("online-user", { users: socketUsers });
    io.emit("new-offline-user", { userId: data.userId });
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
