const mongoose = require("mongoose");

const { DIRECT_MESSAGE, GROUP_MESSAGE } = require("../constants/conversation");

const conversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
      required: [true, "Please enter conversation's members!"],
    },
    type: {
      type: String,
      required: [true, "Please enter conversation's type!"],
      trim: true,
      enum: [DIRECT_MESSAGE, GROUP_MESSAGE],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("conversations", conversationSchema);
