import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Workspace } from '../models/Workspace';
import { AppError } from '../utils/errorHandler';
import { verifyToken, generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(new AppError('User already exists', 400));
    }

    const user = await User.create({ name, email, password });
    
    // Automatically create a personal workspace for the new user
    await Workspace.create({
      name: `${name}'s Workspace`,
      description: 'Personal workspace',
      createdBy: user._id,
      members: [{ userId: user._id, role: 'admin' }]
    });
    
    const accessToken = generateToken(user.id, 'access');
    const refreshToken = generateToken(user.id, 'refresh');

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const accessToken = generateToken(user.id, 'access');
      const refreshToken = generateToken(user.id, 'refresh');

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        accessToken,
        refreshToken
      });
    } else {
      next(new AppError('Invalid email or password', 401));
    }
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) {
      return next(new AppError('Refresh token required', 400));
    }

    const decoded = verifyToken(token, 'refresh') as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('Invalid refresh token', 401));
    }

    const newAccessToken = generateToken(user.id, 'access');
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(new AppError('Invalid refresh token', 401));
  }
};
