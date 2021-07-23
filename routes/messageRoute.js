const router = require("express").Router();

const messageCtrl = require("../controller/messageCtrl");
const auth = require("../middleware/auth");

router.get(
  "/conversations/:conversationId/messages",
  auth,
  messageCtrl.getAllMessageInAConversation
);

router.post(
  "/conversations/:conversationId/messages",
  auth,
  messageCtrl.createMessage
);

module.exports = router;
