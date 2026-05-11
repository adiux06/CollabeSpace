import jwt from 'jsonwebtoken';

export const generateToken = (id: string, type: 'access' | 'refresh'): string => {
  const secret = type === 'access' ? process.env.JWT_SECRET : process.env.JWT_REFRESH_SECRET;
  const expiresIn = type === 'access' ? '15m' : '7d';
  
  if (!secret) {
    throw new Error(`JWT secret not defined for ${type} token`);
  }

  return jwt.sign({ id }, secret, { expiresIn });
};

export const verifyToken = (token: string, type: 'access' | 'refresh') => {
  const secret = type === 'access' ? process.env.JWT_SECRET : process.env.JWT_REFRESH_SECRET;
  
  if (!secret) {
    throw new Error(`JWT secret not defined for ${type} token`);
  }

  return jwt.verify(token, secret);
};
