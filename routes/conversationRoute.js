const router = require("express").Router();

const conversationCtrl = require("../controller/conversationCtrl");
const auth = require("../middleware/auth");

router.get("/users/online", auth, conversationCtrl.getOnlineUsers);

router.get("/me/conversations", auth, conversationCtrl.getMyConversation);

router.post("/me/conversations", auth, conversationCtrl.createMyConversation);

router.get(
  "/conversations/:conversationId",
  auth,
  conversationCtrl.getDetailConversation
);

module.exports = router;
