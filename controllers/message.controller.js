const AgentMessage = require("../models/AgentMessage");
const Message = require("../models/Message");
const UserDeviceModel = require("../models/UserDevice");
const UserMessageModel = require("../models/UserMessage");
const AgentDeviceModel = require("../models/AgentDevice");
const sendNotificationToDevice = require("../services/sendNotificationToDevice");

async function sendMessageUser(req, res) {
  try {
    if (!req.body) {
      return res.status(400).send({
        ok: false,
        message: "Barcha maydonlarni kiriting",
      });
    }

    const { fromId, firstName, lastName, message, toAgent } = req.body;

    if (!fromId || !firstName || !lastName || !toAgent) {
      return res.status(400).send({
        ok: false,
        message: "Barcha maydonlarni kiriting",
      });
    }

    if (!message && !req.file) {
      return res.status(400).send({
        ok: false,
        message: "Xabar yoki rasm yuborish kerak",
      });
    }

    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    await UserMessageModel.updateMany(
      { fromId: fromId },
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
        },
      }
    );

    await Message.updateMany(
      { userId: fromId },
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
        },
      }
    );

    const newMessageUser = new UserMessageModel({
      fromId,
      firstName,
      lastName,
      message: message || "",
      toAgent,
      imageUrl,
      isRead: false,
    });

    const newMainMessage = new Message({
      agentId: toAgent,
      userId: fromId,
      message: message || "",
      sentBy: "user",
      imageUrl,
      firstName: firstName,
      lastName: lastName,
      isRead: false,
    });

    const newMessage = await newMessageUser.save();
    const mainMessage = await newMainMessage.save();

    const userToken = await UserDeviceModel.findOne({ userId: fromId });
    if (userToken && userToken.fcmTokens.length > 0) {
      sendNotificationToDevice(userToken.fcmTokens.token, {
        title: "Yangi xabar",
        body: message,
      });
    }

    res.status(201).send({
      ok: true,
      message: "Xabar muvaffaqiyatli yuborildi",
      data: {
        userMessage: newMessage,
        defaultMessage: mainMessage,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
}

async function sendMessageAgent(req, res) {
  try {
    const { fromId, firstName, lastName, message, toUser } = req.body;

    if (!fromId || !firstName || !lastName || !toUser) {
      return res.status(400).send({
        ok: false,
        message: "Barcha maydonlarni to'ldiring",
      });
    }

    if (!message && !req.file) {
      return res.status(400).send({
        ok: false,
        message: "Xabar yoki rasm yuborish kerak",
      });
    }

    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    await AgentMessage.updateMany(
      { fromId: fromId },
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
        },
      }
    );

    await Message.updateMany(
      { agentId: fromId, sentBy: "agent" },
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
        },
      }
    );

    const newAgentMessage = new AgentMessage({
      fromId,
      firstName,
      lastName,
      message: message || "",
      toUser,
      imageUrl,
      isRead: false,
    });

    const newMainMessage = new Message({
      agentId: fromId,
      userId: toUser,
      message: message || "",
      sentBy: "agent",
      imageUrl,
      firstName: firstName,
      lastName: lastName,
      isRead: false,
    });

    const savedMessage = await newMainMessage.save();
    const newMessage = await newAgentMessage.save();

    const agentToken = await AgentDeviceModel.findOne({ agentId: fromId });
    if (agentToken && agentToken.fcmTokens.length > 0) {
      sendNotificationToDevice(agentToken.fcmTokens.token, {
        title: "Yangi xabar",
        body: message,
      });
    }

    res.status(201).send({
      ok: true,
      message: "Agentga xabar muvaffaqiyatli yuborildi",
      data: {
        agentMessage: newMessage,
        defaultMessage: savedMessage,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
}

async function getMessagesUserById(req, res) {
  try {
    const { id, page = 1, limit = 20 } = req.query;

    if (!id) {
      return res.status(400).send({
        ok: false,
        message: "Foydalanuvchi ID kiritilishi kerak",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalMessages = await AgentMessage.countDocuments({ toUser: id });
    const messages = await AgentMessage.find({ toUser: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    if (messages.length === 0 && pageNum === 1) {
      return res.status(404).send({
        ok: false,
        message: "Bu foydalanuvchida xozircha xabarlar mavjud emas",
      });
    }

    const totalPages = Math.ceil(totalMessages / limitNum);

    res.status(200).send({
      ok: true,
      message: "Xabarlar topildi",
      data: messages,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalMessages,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
}

async function getMessagesAgentById(req, res) {
  try {
    const { id, page = 1, limit = 20 } = req.query;

    if (!id) {
      return res.status(400).send({
        ok: false,
        message: "Agent ID kiritilishi kerak",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalMessages = await UserMessageModel.countDocuments({
      toAgent: id,
    });
    const messages = await UserMessageModel.find({ toAgent: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    if (messages.length === 0 && pageNum === 1) {
      return res.status(404).send({
        ok: false,
        message: "Bu agent xozircha xabarlar mavjud emas",
      });
    }

    const totalPages = Math.ceil(totalMessages / limitNum);

    res.status(200).send({
      ok: true,
      message: "Xabarlar topildi",
      data: messages,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalMessages,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
}

async function getMessages(req, res) {
  try {
    const { agentId, userId, page = 1, limit = 50 } = req.query;

    if (!agentId || !userId) {
      return res.status(400).send({
        ok: false,
        message: "Agent va foydalanuvchi ID kiritilishi kerak",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalMessages = await Message.countDocuments({
      agentId,
      userId,
    });

    const messages = await Message.find({
      agentId,
      userId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    if (messages.length === 0 && pageNum === 1) {
      return res.status(404).send({
        ok: false,
        message: "Hali bu odamlar yozishmalar uyishtirmagan",
      });
    }

    const totalPages = Math.ceil(totalMessages / limitNum);

    res.status(200).send({
      ok: true,
      message: "Yozishmalar topildi",
      data: messages,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalMessages,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
}

async function messagesWrittenToAgent(req, res) {
  try {
    const { agentId, page = 1, limit = 10 } = req.query;

    if (!agentId) {
      return res.status(400).json({
        ok: false,
        message: "agentId is required",
      });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({
        ok: false,
        message: "Sahifa va limit musbat son bo'lishi kerak",
      });
    }

    const skip = (pageNumber - 1) * limitNumber;

    const allUsers = await Message.aggregate([
      { $match: { agentId } },
      {
        $group: {
          _id: "$userId",
          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
          isRead: { $first: "$isRead" },
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          firstName: 1,
          lastName: 1,
          isRead: 1,
        },
      },
    ]).sort({ createdAt: -1 });

    if (allUsers.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Bu agentga xali xabarlar yo'q",
      });
    }

    const totalUsers = allUsers.length;
    const totalPages = Math.ceil(totalUsers / limitNumber);

    const paginatedUsers = allUsers.slice(skip, skip + limitNumber);
    const userIdsOnPage = paginatedUsers.map((u) => u.userId);

    const messagesRaw = await Message.find({
      agentId,
      userId: { $in: userIdsOnPage },
    }).sort({ createdAt: -1 });

    const messages = [messagesRaw[0]];
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    return res.status(200).json({
      ok: true,
      messages,
      userIds: paginatedUsers,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalUsers,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      message: "Server xatosi",
    });
  }
}

async function deleteChat(req, res) {
  try {
    const { userId, agentId } = req.query;

    const messages = await Message.find({
      userId,
      agentId,
    });

    if (messages.length === 0) {
      return res.status(404).send({
        ok: false,
        message: "Bu agent va foydalanuvchi xali yozishmalar uyushtirishmagan",
      });
    }

    messages.map(async (message) => {
      await Message.findByIdAndDelete(message._id);
      await AgentMessage.deleteOne({ toUser: message.userId });
      await UserMessageModel.deleteOne({ toAgent: message.agentId });
    });

    res.status(200).send({
      ok: false,
      message: "Barchasi o'chirildi",
      deletedMessages: messages.length,
    });
  } catch (err) {
    res.status(500).send({
      ok: false,
      message: "Qandaydir ichki xatolik yuz berdi",
      error: err,
    });
  }
}

async function markMessagesAsReadByAgent(req, res) {
  try {
    const { agentId, userId } = req.body;

    if (!agentId || !userId) {
      return res.status(400).send({
        ok: false,
        message: "Agent va foydalanuvchi ID kiritilishi kerak",
      });
    }

    await UserMessageModel.updateMany(
      { toAgent: agentId, fromId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    const result = await Message.updateMany(
      { agentId, userId, sentBy: "user", isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).send({
      ok: true,
      message: "Xabarlar o'qilgan deb belgilandi",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
}

// Mark messages as read when user opens chat with agent
async function markMessagesAsReadByUser(req, res) {
  try {
    const { userId, agentId } = req.body;

    if (!userId || !agentId) {
      return res.status(400).send({
        ok: false,
        message: "Foydalanuvchi va agent ID kiritilishi kerak",
      });
    }

    // Mark messages from agent to user as read in AgentMessage collection
    await AgentMessage.updateMany(
      { toUser: userId, fromId: agentId, isRead: false },
      { $set: { isRead: true } }
    );

    // Mark messages in main Message collection where sentBy is agent
    const result = await Message.updateMany(
      { userId, agentId, sentBy: "agent", isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).send({
      ok: true,
      message: "Xabarlar o'qilgan deb belgilandi",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
}

// Get unread message count for agent (from all users)
async function getUnreadCountForAgent(req, res) {
  try {
    const { agentId } = req.query;

    if (!agentId) {
      return res.status(400).send({
        ok: false,
        message: "Agent ID kiritilishi kerak",
      });
    }

    const unreadCount = await UserMessageModel.countDocuments({
      toAgent: agentId,
      isRead: false,
    });

    res.status(200).send({
      ok: true,
      unreadCount,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
}

// Get unread message count for user (from all agents)
async function getUnreadCountForUser(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).send({
        ok: false,
        message: "Foydalanuvchi ID kiritilishi kerak",
      });
    }

    const unreadCount = await AgentMessage.countDocuments({
      toUser: userId,
      isRead: false,
    });

    res.status(200).send({
      ok: true,
      unreadCount,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
}

// Check if last message from user to agent is read (with pagination for message history)
async function checkLastMessageReadStatus(req, res) {
  try {
    const { agentId, userId, page = 1, limit = 50 } = req.query;

    if (!agentId || !userId) {
      return res.status(400).send({
        ok: false,
        message: "Agent va foydalanuvchi ID kiritilishi kerak",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get last message sent by user to this agent
    const lastUserMessage = await Message.findOne({
      agentId,
      userId,
      sentBy: "user",
    }).sort({ createdAt: -1 });

    // Get last message sent by agent to this user
    const lastAgentMessage = await Message.findOne({
      agentId,
      userId,
      sentBy: "agent",
    }).sort({ createdAt: -1 });

    // Get paginated message history
    const totalMessages = await Message.countDocuments({ agentId, userId });
    const messages = await Message.find({ agentId, userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).send({
      ok: true,
      lastUserMessage: lastUserMessage
        ? {
            messageId: lastUserMessage._id,
            message: lastUserMessage.message,
            isRead: lastUserMessage.isRead,
            createdAt: lastUserMessage.createdAt,
            sentBy: "user",
          }
        : null,
      lastAgentMessage: lastAgentMessage
        ? {
            messageId: lastAgentMessage._id,
            message: lastAgentMessage.message,
            isRead: lastAgentMessage.isRead,
            createdAt: lastAgentMessage.createdAt,
            sentBy: "agent",
          }
        : null,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalMessages / limitNum),
        totalMessages,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalMessages / limitNum),
        hasPrevPage: pageNum > 1,
      },
      messages,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
}

// Get unread count per user for an agent with pagination
async function getUnreadCountPerUserForAgent(req, res) {
  try {
    const { agentId, page = 1, limit = 20 } = req.query;

    if (!agentId) {
      return res.status(400).send({
        ok: false,
        message: "Agent ID kiritilishi kerak",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count of users with unread messages
    const totalUsersWithUnread = await UserMessageModel.distinct("fromId", {
      toAgent: agentId,
      isRead: false,
    });

    const unreadCounts = await UserMessageModel.aggregate([
      { $match: { toAgent: agentId, isRead: false } },
      {
        $group: {
          _id: "$fromId",
          unreadCount: { $sum: 1 },
          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
          lastMessageDate: { $max: "$createdAt" },
        },
      },
      { $sort: { lastMessageDate: -1 } },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          firstName: 1,
          lastName: 1,
          unreadCount: 1,
          lastMessageDate: 1,
        },
      },
    ]);

    res.status(200).send({
      ok: true,
      data: unreadCounts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalUsersWithUnread.length / limitNum),
        totalUsers: totalUsersWithUnread.length,
        limit: limitNum,
        hasNextPage:
          pageNum < Math.ceil(totalUsersWithUnread.length / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
}

// Get all unread messages for agent with pagination
async function getUnreadMessagesForAgent(req, res) {
  try {
    const { agentId, page = 1, limit = 50 } = req.query;

    if (!agentId) {
      return res.status(400).send({
        ok: false,
        message: "Agent ID kiritilishi kerak",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalUnread = await UserMessageModel.countDocuments({
      toAgent: agentId,
      isRead: false,
    });

    const unreadMessages = await UserMessageModel.find({
      toAgent: agentId,
      isRead: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).send({
      ok: true,
      data: unreadMessages,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalUnread / limitNum),
        totalUnread,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalUnread / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
}

// Get all unread messages for user with pagination
async function getUnreadMessagesForUser(req, res) {
  try {
    const { userId, page = 1, limit = 50 } = req.query;

    if (!userId) {
      return res.status(400).send({
        ok: false,
        message: "Foydalanuvchi ID kiritilishi kerak",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalUnread = await AgentMessage.countDocuments({
      toUser: userId,
      isRead: false,
    });

    const unreadMessages = await AgentMessage.find({
      toUser: userId,
      isRead: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).send({
      ok: true,
      data: unreadMessages,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalUnread / limitNum),
        totalUnread,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalUnread / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
}

async function registerDeviceUser(req, res) {
  try {
    const { userId, fcmToken, device } = req.body;

    if (!userId || !fcmToken || !device) {
      return res.status(400).send({
        ok: false,
        message: "Barcha maydonlarni to'ldiring",
      });
    }

    let userDevice = await UserDeviceModel.findOne({ userId });

    if (!userDevice) {
      userDevice = new UserDeviceModel({ userId, fcmTokens: [] });
    } else {
      return res.status(400).send({
        ok: false,
        message: "Foydalanuvchi qurilmasi allaqachon ro'yxatdan o'tgan",
      });
    }

    // Check if token already exists
    const tokenExists = userDevice.fcmTokens.some((t) => t.token === fcmToken);

    if (!tokenExists) {
      userDevice.fcmTokens.push({ token: fcmToken, device });
      await userDevice.save();
    } else {
      return res.status(400).send({
        ok: false,
        message: "Ushbu token allaqachon ro'yxatdan o'tgan",
      });
    }

    return res.status(200).send({
      ok: true,
      message: "Foydalanuvchi qurilmasi muvaffaqiyatli ro'yxatdan o'tdi",
    });
  } catch (err) {
    return res.status(500).send({
      ok: false,
      message: "Ichki server xatosi",
    });
  }
}

async function registerDeviceAgent(req, res) {
  try {
    const { agentId, fcmToken, device } = req.body;

    if (!agentId || !fcmToken || !device) {
      return res.status(400).send({
        ok: false,
        message: "Barcha maydonlarni to'ldiring",
      });
    }

    let agentDevice = await AgentDeviceModel.findOne({ agentId });

    if (!agentDevice) {
      agentDevice = new AgentDeviceModel({ agentId, fcmTokens: [] });
    } else {
      return res.status(400).send({
        ok: false,
        message: "Foydalanuvchi qurilmasi allaqachon ro'yxatdan o'tgan",
      });
    }

    const tokenExists = agentDevice.fcmTokens.some((t) => t.token === fcmToken);

    if (!tokenExists) {
      agentDevice.fcmTokens.push({ token: fcmToken, device });
      await agentDevice.save();
    } else {
      return res.status(400).send({
        ok: false,
        message: "Ushbu token allaqachon ro'yxatdan o'tgan",
      });
    }

    return res.status(200).send({
      ok: true,
      message: "Foydalanuvchi qurilmasi muvaffaqiyatli ro'yxatdan o'tdi",
    });
  } catch (err) {
    return res.status(500).send({
      ok: false,
      message: "Ichki server xatosi",
    });
  }
}

module.exports = {
  sendMessageUser,
  sendMessageAgent,
  getMessagesUserById,
  getMessagesAgentById,
  getMessages,
  messagesWrittenToAgent,
  deleteChat,
  markMessagesAsReadByAgent,
  markMessagesAsReadByUser,
  getUnreadCountForAgent,
  getUnreadCountForUser,
  checkLastMessageReadStatus,
  getUnreadCountPerUserForAgent,
  getUnreadMessagesForUser,
  getUnreadMessagesForAgent,
  registerDeviceUser,
  registerDeviceAgent,
};
