// backend/src/controllers/chatController.js
const { sendMessageToGemini } = require('../services/geminiService');
const { User, Chat, Message } = require('../models');
const { Op } = require('sequelize');

// Send message with credit deduction
exports.sendMessage = async (req, res) => {
  const { message, chatId } = req.body;
  const userId = req.user.id;

  try {
    // Get user and check credits
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.credits <= 0) {
      return res.status(403).json({ 
        msg: 'Insufficient credits',
        credits: 0 
      });
    }

    // Find or create chat
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ 
        where: { id: chatId, userId },
        include: [{ 
          model: Message, 
          as: 'messages', 
          separate: true, // needed to use limit/order on included model
          limit: 10, 
          order: [['createdAt', 'DESC']]
        }]
      });
    }

    if (!chat) {
      // Create new chat with title from first message
      const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
      chat = await Chat.create({
        userId,
        title,
        lastMessage: message,
        lastMessageAt: new Date(),
      });
    }

    // Save user message
    await Message.create({
      chatId: chat.id,
      sender: 'user',
      text: message,
    });

    // Get conversation history
    const history = chat.messages ? [...chat.messages].reverse().map(msg => ({
      sender: msg.sender,
      text: msg.text,
    })) : [];

    // Get AI response
    const aiResponse = await sendMessageToGemini(message, history);
    if (!aiResponse || typeof aiResponse !== 'string') {
      throw new Error('Empty response from AI provider');
    }

    // Save AI message
    await Message.create({
      chatId: chat.id,
      sender: 'ai',
      text: aiResponse,
    });

    // Update chat
    await chat.update({
      lastMessage: aiResponse,
      lastMessageAt: new Date(),
    });

    // Deduct credit
    await user.update({ credits: user.credits - 1 });

    res.json({ 
      reply: aiResponse,
      chatId: chat.id,
      credits: user.credits - 1,
      chatTitle: chat.title,
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ msg: 'Chat error', error: err.message });
  }
};

// Get all user chats
exports.getUserChats = async (req, res) => {
  const userId = req.user.id;

  try {
    const chats = await Chat.findAll({
      where: { userId },
      order: [['lastMessageAt', 'DESC']],
      attributes: ['id', 'title', 'lastMessage', 'lastMessageAt'],
    });

    res.json({ chats });
  } catch (err) {
    console.error('Get chats error:', err);
    res.status(500).json({ msg: 'Failed to fetch chats' });
  }
};

// Get chat messages
exports.getChatMessages = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    const chat = await Chat.findOne({
      where: { id: chatId, userId },
      include: [{ 
        model: Message, 
        as: 'messages', 
        separate: true,
        order: [['createdAt', 'ASC']]
      }],
    });

    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found' });
    }

    res.json({ 
      chat: {
        id: chat.id,
        title: chat.title,
        messages: chat.messages,
      }
    });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ msg: 'Failed to fetch messages' });
  }
};

// Delete chat
exports.deleteChat = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    const chat = await Chat.findOne({ where: { id: chatId, userId } });
    
    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found' });
    }

    // Delete all messages first
    await Message.destroy({ where: { chatId } });
    
    // Delete chat
    await chat.destroy();

    res.json({ msg: 'Chat deleted successfully' });
  } catch (err) {
    console.error('Delete chat error:', err);
    res.status(500).json({ msg: 'Failed to delete chat' });
  }
};

// Get user credits
exports.getUserCredits = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'credits'],
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ 
      credits: user.credits,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (err) {
    console.error('Get credits error:', err);
    res.status(500).json({ msg: 'Failed to fetch credits' });
  }
};