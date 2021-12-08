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
    type: {
      type: String,
      trim: true,
    },
    text: {
      type: String,
      trim: true,
    },
    path: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("messages", messageSchema);
