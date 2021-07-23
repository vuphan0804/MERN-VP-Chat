const _ = require("lodash");
const mongoose = require("mongoose");
const fullTextSearch = require("fulltextsearch");

const userModel = require("../models/userModel");
const conversationModel = require("../models/conversationModel");

const { DIRECT_MESSAGE } = require("../constants/conversation");

const fullTextSearchVi = fullTextSearch.vi;

const conversationCtrl = {
  getOnlineUsers: async (req, res) => {
    try {
      const onlineUsers = await userModel.aggregate([
        { $match: { is_online: true } },
        { $project: { _id: 1, name: 1, avatar: 1 } },
        { $sort: { created_by: -1 } },
      ]);

      res.json({ users: onlineUsers });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getMyConversation: async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { search } = req.query;

      const conversations = await conversationModel.aggregate([
        {
          $match: {
            members: {
              $in: [userId],
            },
          },
        },
        {
          $sort: {
            updatedAt: -1,
          },
        },
        {
          $unwind: {
            path: "$members",
          },
        },
        {
          $lookup: {
            from: "users",
            let: {
              userId: "$members",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [{ $toString: "$_id" }, "$$userId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  avatar: 1,
                },
              },
            ],
            as: "members",
          },
        },
        {
          $unwind: {
            path: "$members",
          },
        },
        {
          $group: {
            _id: {
              _id: "$_id",
              type: "$type",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
            },
            members: {
              $push: "$members",
            },
          },
        },
        {
          $match: {
            members: {
              $elemMatch: {
                $and: [
                  { name: new RegExp(fullTextSearchVi(search), "i") },
                  { _id: { $ne: mongoose.Types.ObjectId(userId) } },
                ],
              },
            },
          },
        },
      ]);

      const resData = conversations.map((con) => {
        const copyCon = Object.assign(con);
        const { _id } = copyCon;
        const rest = _.omit(copyCon, "_id");
        return {
          ..._id,
          ...rest,
        };
      });

      res.json({ conversations: resData });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createMyConversation: async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { otherMembers, type } = req.body;

      // check exsit conversation
      const members = [...otherMembers, userId].sort();
      const matchedConversation = await conversationModel.aggregate([
        {
          $match: {
            members: {
              $in: members,
            },
          },
        },
      ]);
      let flagExistConversation = false;
      let resConversation = {};
      for (const conversation of matchedConversation) {
        const memberIds = conversation.members.sort();
        if (_.isEqual(memberIds, members)) {
          flagExistConversation = true; // conversation exsits
          resConversation = conversation;
          break;
        }
      }
      if (flagExistConversation)
        return res.status(200).json({ conversation: resConversation });

      // new conversation:
      const newConversationData = {
        members,
        type: DIRECT_MESSAGE,
      };
      const newConversation = new conversationModel(newConversationData);
      const insertedNewConversation = await newConversation.save();

      res.status(201).json({ conversation: insertedNewConversation });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getDetailConversation: async (req, res) => {
    try {
      const { conversationId } = req.params;
      try {
        const testId = mongoose.Types.ObjectId(conversationId);
      } catch (error) {
        return res.status(400).json({ msg: "Conversation does not exsit" });
      }

      const conversations = await conversationModel.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(conversationId),
          },
        },
        {
          $unwind: {
            path: "$members",
          },
        },
        {
          $lookup: {
            from: "users",
            let: {
              userId: "$members",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [{ $toString: "$_id" }, "$$userId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  avatar: 1,
                },
              },
            ],
            as: "members",
          },
        },
        {
          $unwind: {
            path: "$members",
          },
        },
        {
          $group: {
            _id: {
              _id: "$_id",
              type: "$type",
              createdAt: "$createdAt",
              updateAt: "$updateAt",
            },
            members: {
              $push: "$members",
            },
          },
        },
      ]);

      if (conversations.length === 0)
        return res.status(400).json({ msg: "Conversation does not exsit" });

      const foundCon = conversations[0];
      const copyCon = Object.assign(foundCon);
      const { _id } = copyCon;
      const rest = _.omit(copyCon, "_id");
      const resData = {
        ..._id,
        ...rest,
      };

      res.json({ conversation: resData });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = conversationCtrl;
