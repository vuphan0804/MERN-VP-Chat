require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const http = require("http");
const morgan = require("morgan");

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

// SocketIO:
io.on("connection", (socket) => {
  // online state:
  socket.on("user-connected", (data) => {
    console.log("connect");
    console.log(data);
  });
  socket.on("user-disconnected", (data) => {
    console.log("disconnect");
    console.log(data);
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
