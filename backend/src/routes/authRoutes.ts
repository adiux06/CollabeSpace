import express from 'express';
import { register, login, refreshToken } from '../controllers/authController';
// validation can be added here as middleware using Zod

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

export default router;
