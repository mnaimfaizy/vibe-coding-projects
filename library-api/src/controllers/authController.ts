import { Request, Response } from 'express';
import { connectDatabase } from '../db/database';
import { User } from '../models/User';
import {
  hashPassword,
  comparePassword,
  generateToken,
  sanitizeUser,
  generateResetToken,
  calculateExpiryTime
} from '../utils/helpers';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please provide name, email, and password' });
      return;
    }

    // Connect to database
    const db = await connectDatabase();

    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const result = await db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    if (result.lastID) {
      // Fetch the created user
      const newUser = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]) as User;

      // Generate JWT token
      const token = generateToken(newUser);

      res.status(201).json({
        message: 'User registered successfully',
        user: sanitizeUser(newUser),
        token
      });
    } else {
      res.status(500).json({ message: 'Failed to register user' });
    }
  } catch (error: any) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    // Connect to database
    const db = await connectDatabase();

    // Find user by email
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]) as User;

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Validate password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token
    res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user),
      token
    });
  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Logout user (client-side token removal)
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  // JWT tokens are stateless, so we just tell the client the logout was successful
  // The client should remove the token from storage
  res.status(200).json({ message: 'Logout successful' });
};

/**
 * Change user password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      res.status(400).json({ 
        message: 'Please provide current password and new password' 
      });
      return;
    }

    // Connect to database
    const db = await connectDatabase();

    // Get current user
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]) as User;

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.run(
      'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId]
    );

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Please provide an email address' });
      return;
    }

    // Connect to database
    const db = await connectDatabase();

    // Find user by email
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]) as User;

    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      res.status(200).json({ 
        message: 'If your email is in our system, you will receive a password reset link' 
      });
      return;
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiryTime = calculateExpiryTime();

    // Remove any existing tokens for this user
    await db.run('DELETE FROM reset_tokens WHERE userId = ?', [user.id]);

    // Store token in database
    await db.run(
      'INSERT INTO reset_tokens (userId, token, expiresAt) VALUES (?, ?, ?)',
      [user.id, resetToken, expiryTime.toISOString()]
    );

    // In a real application, you would send an email with the reset link
    // For this demo, we'll just return the token
    console.log(`Reset token for ${email}: ${resetToken}`);

    res.status(200).json({ 
      message: 'If your email is in our system, you will receive a password reset link',
      // Only for development purposes
      resetToken
    });
  } catch (error: any) {
    console.error('Request password reset error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Reset password using token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ 
        message: 'Please provide a token and new password' 
      });
      return;
    }

    // Connect to database
    const db = await connectDatabase();

    // Find token in database
    const resetRequest = await db.get(
      'SELECT * FROM reset_tokens WHERE token = ? AND expiresAt > CURRENT_TIMESTAMP',
      [token]
    );

    if (!resetRequest) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }

    // Get user
    const user = await db.get(
      'SELECT * FROM users WHERE id = ?',
      [resetRequest.userId]
    ) as User;

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.run(
      'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, user.id]
    );

    // Delete used token
    await db.run('DELETE FROM reset_tokens WHERE userId = ?', [user.id]);

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};