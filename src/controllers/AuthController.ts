import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// Generate JWT token
const generateToken = (id: string): string => {
  const jwtSecret = process.env.JWT_SECRET!;
  return jwt.sign({ id }, jwtSecret, { expiresIn: '7d' });
};

export class AuthController {

  // Register new user
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      // Validate fields
      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Please provide name, email and password',
        });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken(user._id.toString());

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message,
      });
    }
  }

  // Login user
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate fields
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Please provide email and password',
        });
        return;
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Generate token
      const token = generateToken(user._id.toString());

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: error.message,
      });
    }
  }

  // Get current user profile
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.user?.id).select('-password');

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching profile',
        error: error.message,
      });
    }
  }

  // Update user profile
  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      const user = await User.findById(req.user?.id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Update fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error updating profile',
        error: error.message,
      });
    }
  }
}