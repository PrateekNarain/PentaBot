// backend/src/routes/chatRoutes.js
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const chatController = require('../controllers/chatController');
const router = express.Router();

// Protected routes
router.post('/message', authMiddleware, chatController.sendMessage);
router.get('/chats', authMiddleware, chatController.getUserChats);
router.get('/chats/:chatId', authMiddleware, chatController.getChatMessages);
router.delete('/chats/:chatId', authMiddleware, chatController.deleteChat);
router.get('/credits', authMiddleware, chatController.getUserCredits);

module.exports = router;