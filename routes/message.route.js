const { Router } = require("express");
const {
  getMessagesUserById,
  getMessagesAgentById,
  sendMessageUser,
  sendMessageAgent,
  getMessages,
  messagesWrittenToAgent,
} = require("../controllers/message.controller");
const upload = require("../config/multer.config");

const router = Router();

router.get("/get-message-by-user-id", getMessagesUserById);
router.get("/get-message-by-agent-id", getMessagesAgentById);
router.post("/send-message-user", upload.single("image"), sendMessageUser);
router.post("/send-message-agent", upload.single("image"), sendMessageAgent);
router.get("/get-messages", getMessages);
router.get("/messages-written-to-agent", messagesWrittenToAgent);

module.exports = router;
