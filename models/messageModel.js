const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Types.ObjectId,
      required: [true, "Please enter conversation's id!"],
    },
    sender: {
      type: mongoose.Types.ObjectId,
      required: [true, "Please enter message's sender!"],
      trim: true,
    },
    text: {
      type: String,
      required: [true, "Please enter message's content!"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("messages", messageSchema);
