import asyncHandler from 'express-async-handler';
import Admin from '../models/Admin.js';
import { signToken } from '../utils/token.js';

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }
  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin || !(await admin.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const token = signToken(admin);
  res
    .cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    })
    .json({ token, admin: admin.toSafeJSON() });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ admin: req.admin.toSafeJSON() });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out' });
});
