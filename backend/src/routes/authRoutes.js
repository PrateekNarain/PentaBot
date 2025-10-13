// backend/src/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Username/Password
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.get('/verify', authMiddleware, authController.verifyToken);
router.post('/logout', authMiddleware, (req, res) => {
  // Invalidate token (e.g., add to blacklist or reduce TTL)
  res.json({ msg: 'Logged out' });
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/signin' }), authController.googleCallback);

module.exports = router;