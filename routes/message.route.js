const { Router } = require("express");
const {
  getMessagesUserById,
  getMessagesAgentById,
  sendMessageUser,
  sendMessageAgent,
  getMessages,
  messagesWrittenToAgent,
  deleteChat,
  markMessagesAsReadByAgent,
  markMessagesAsReadByUser,
  getUnreadCountForAgent,
  getUnreadCountForUser,
  checkLastMessageReadStatus,
  getUnreadCountPerUserForAgent,
  registerDeviceUser,
  registerDeviceAgent,
} = require("../controllers/message.controller");
const upload = require("../config/multer.config");

const router = Router();

router.get("/get-message-by-user-id", getMessagesUserById);
router.get("/get-message-by-agent-id", getMessagesAgentById);
router.post("/send-message-user", upload.single("image"), sendMessageUser);
router.post("/send-message-agent", upload.single("image"), sendMessageAgent);
router.get("/get-messages", getMessages);
router.get("/messages-written-to-agent", messagesWrittenToAgent);
router.delete("/delete-chat", deleteChat);
router.post("/mark-read-by-agent", markMessagesAsReadByAgent);
router.post("/mark-read-by-user", markMessagesAsReadByUser);
router.get("/unread-count-agent", getUnreadCountForAgent);
router.get("/unread-count-user", getUnreadCountForUser);
router.get("/last-message-status", checkLastMessageReadStatus);
router.get("/unread-per-user", getUnreadCountPerUserForAgent);
router.post("/register-device-user", registerDeviceUser);
router.post("/register-device-agent", registerDeviceAgent);

module.exports = router;
