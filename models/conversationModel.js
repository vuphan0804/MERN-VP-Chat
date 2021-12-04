const mongoose = require("mongoose");

const {
  SELF_MESSAGE,
  DIRECT_MESSAGE,
  GROUP_MESSAGE,
} = require("../constants/conversation");

const conversationSchema = new mongoose.Schema(
  {
    members: {
      type: [String],
      required: [true, "Please enter conversation's members!"],
    },
    type: {
      type: String,
      required: [true, "Please enter conversation's type!"],
      trim: true,
      enum: [SELF_MESSAGE, DIRECT_MESSAGE, GROUP_MESSAGE],
    },
    name: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("conversations", conversationSchema);
