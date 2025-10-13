// backend/src/models/index.js
const sequelize = require('../config/db');
const User = require('./User');
const Organization = require('./Organization');
const Chat = require('./Chat');
const Message = require('./Message');

// User <-> Organization Associations
User.hasMany(Organization, { foreignKey: 'ownerId' });
Organization.belongsTo(User, { foreignKey: 'ownerId' });

// User <-> Chat Associations
User.hasMany(Chat, { foreignKey: 'userId', as: 'chats' });
Chat.belongsTo(User, { foreignKey: 'userId' });

// Chat <-> Message Associations
Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });
Message.belongsTo(Chat, { foreignKey: 'chatId' });

module.exports = { User, Organization, Chat, Message };