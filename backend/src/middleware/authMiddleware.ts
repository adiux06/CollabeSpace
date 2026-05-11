import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/errorHandler';
import { User } from '../models/User';
import { Types } from 'mongoose';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized, no token', 401));
    }

    const decoded = verifyToken(token, 'access') as { id: string };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new AppError('User not found', 401));
    }

    req.user = {
      _id: user._id as Types.ObjectId,
      id: user.id
    };
    next();
  } catch (error) {
    next(new AppError('Not authorized, token failed', 401));
  }
};
