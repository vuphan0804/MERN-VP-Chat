const _ = require("lodash");
const mongoose = require("mongoose");

const userModel = require("../models/userModel");
const conversationModel = require("../models/conversationModel");
const messageModel = require("../models/messageModel");

const messageCtrl = {
  getAllMessageInAConversation: async (req, res) => {
    try {
      const { conversationId } = req.params;

      // check conversation:
      try {
        const idTest = mongoose.Types.ObjectId(conversationId);
      } catch (error) {
        return res.status(400).json({ msg: "Conversation does not exsit" });
      }
      const conversation = await conversationModel.findById(conversationId);
      if (!conversation)
        return res.status(400).json({ msg: "Conversation does not exsit" });

      // get messages in conversation:
      const messages = await messageModel.aggregate([
        {
          $match: {
            conversationId: mongoose.Types.ObjectId(conversationId),
          },
        },
        {
          $lookup: {
            from: "users",
            let: {
              sender: "$sender",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$sender", "$_id"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  avatar: 1,
                  name: 1,
                },
              },
            ],
            as: "sender",
          },
        },
        {
          $unwind: {
            path: "$sender",
          },
        },
      ]);

      res.json({ messages });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createMessage: async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { id: userId } = req.user;
      const { text } = req.body;

      // check conversation:
      try {
        const idTest = mongoose.Types.ObjectId(conversationId);
      } catch (error) {
        return res.status(400).json({ msg: "Conversation does not exsit" });
      }
      const conversation = await conversationModel.findById(conversationId);
      if (!conversation)
        return res.status(400).json({ msg: "Conversation does not exsit" });

      // create message:
      const newMsgData = {
        conversationId,
        sender: userId,
        text,
      };
      const newMsg = new messageModel(newMsgData);
      await newMsg.save();
      await conversationModel.updateOne(
        { _id: mongoose.Types.ObjectId(conversationId) },
        { updateAt: Date.now().toString() }
      );

      res.status(201).json({ msg: "Create message successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = messageCtrl;
