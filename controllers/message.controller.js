const AgentMessage = require("../models/AgentMessage");
const Message = require("../models/Message");
const UserMessageModel = require("../models/UserMessage");

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

    // Check if either message or image is provided
    if (!message && !req.file) {
      return res.status(400).send({
        ok: false,
        message: "Xabar yoki rasm yuborish kerak",
      });
    }

    // Get image URL (for local storage)
    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    // For Cloudinary, use:
    // const imageUrl = req.file ? req.file.path : null;

    const newMessageUser = new UserMessageModel({
      fromId,
      firstName,
      lastName,
      message: message || "",
      toAgent,
      imageUrl,
    });

    const newMainMessage = new Message({
      agentId: toAgent,
      userId: fromId,
      message: message || "",
      sentBy: "user",
      imageUrl,
    });

    const newMessage = await newMessageUser.save();
    const mainMessage = await newMainMessage.save();

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

    // Check if either message or image is provided
    if (!message && !req.file) {
      return res.status(400).send({
        ok: false,
        message: "Xabar yoki rasm yuborish kerak",
      });
    }

    // Get image URL (for local storage)
    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    // For Cloudinary, use:
    // const imageUrl = req.file ? req.file.path : null;

    const newAgentMessage = new AgentMessage({
      fromId,
      firstName,
      lastName,
      message: message || "",
      toUser,
      imageUrl,
    });

    const newMainMessage = new Message({
      agentId: fromId,
      userId: toUser,
      message: message || "",
      sentBy: "agent",
      imageUrl,
    });

    const savedMessage = await newMainMessage.save();
    const newMessage = await newAgentMessage.save();

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

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (pageNumber < 1 || limitNumber < 1) {
      return res.status(400).send({
        ok: false,
        message: "Sahifa va limit musbat son bo'lishi kerak",
      });
    }

    const skip = (pageNumber - 1) * limitNumber;

    const totalMessages = await Message.countDocuments({ agentId: agentId });

    const messages = await UserMessageModel.find({ toAgent: agentId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    if (totalMessages === 0) {
      return res.status(404).send({
        ok: false,
        message: "Bu agentga xali xabarlar yo'q",
      });
    }

    // Get unique users who have written to this agent
    const uniqueUsers = await UserMessageModel.aggregate([
      { $match: { toAgent: agentId } },
      {
        $group: {
          _id: "$fromId",
          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          firstName: 1,
          lastName: 1,
        },
      },
    ]);

    const totalPages = Math.ceil(totalMessages / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.status(200).send({
      ok: true,
      messages,
      userIds: uniqueUsers, // Array of unique user objects
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalMessages,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      ok: false,
      message: "Server xatosi",
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
};
