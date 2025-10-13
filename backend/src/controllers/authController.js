// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const { User, Organization } = require('../models');
const passport = require('passport');
require('dotenv').config();

exports.signup = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    let user = await User.findOne({ where: { username } });
  if (user) return res.status(400).json({ message: 'User exists' });

    user = await User.create({ username, password, email });

    // Create default organization
    await Organization.create({ name: 'Default Org', ownerId: user.id });

    // Assign as Admin (role)
    await user.update({ role: 'admin' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        credits: user.credits 
      } 
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.signin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !(await user.validPassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username,
        email: user.email,
        credits: user.credits 
      } 
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify token and return user info
exports.verifyToken = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'credits', 'role'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        credits: user.credits,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('Verify token error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Google OAuth Callback (handled by Passport)
exports.googleCallback = (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ 
    token, 
    user: { 
      id: req.user.id, 
      username: req.user.username,
      email: req.user.email,
      credits: req.user.credits 
    } 
  });
};