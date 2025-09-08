const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
const auth = require('../middleware/auth');
const { authRateLimit } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin, checkValidation } = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', 
  authRateLimit,
  validateRegister,
  checkValidation,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await db('users')
        .select('id')
        .where('email', email)
        .first();

      if (existingUser) {
        return res.status(409).json({
          error: 'User with this email already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create username from email (since the existing schema requires it)
      const emailPrefix = email.split('@')[0];
      const username = `${emailPrefix}_${Date.now()}`.substring(0, 50); // Ensure it fits in 50 chars

      // Create user (let database auto-increment the ID)
      const [insertResult] = await db('users').insert({
        name,
        username,
        email,
        password_hash: passwordHash
      }).returning('id');

      // Extract the ID (handle both object and direct value returns)
      const userId = typeof insertResult === 'object' ? insertResult.id : insertResult;

      // Get the created user (without password hash)
      const newUser = await db('users')
        .select('id', 'name', 'username', 'email')
        .where('id', userId)
        .first();

      res.status(201).json({
        success: true,
        user: newUser
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal server error during registration'
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login',
  authRateLimit,
  validateLogin,
  checkValidation,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email - only select columns that exist
      const user = await db('users')
        .select('id', 'name', 'username', 'email', 'password_hash')
        .where('email', email)
        .first();

      if (!user) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          sub: user.id,
          email: user.email,
          username: user.username
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
        }
      );

      // Return token and user info (without password hash)
      const { password_hash, ...userWithoutPassword } = user;
      
      res.status(200).json({
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error during login'
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', auth, async (req, res) => {
  try {
    // Get full user profile from database - only select columns that exist
    const user = await db('users')
      .select('id', 'name', 'username', 'email', 'created_at', 'updated_at')
      .where('id', req.user.id)
      .first();

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching profile'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', auth, (req, res) => {
  // Since JWT tokens are stateless, logout is handled client-side
  // This endpoint exists for consistency and future token blacklisting
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
