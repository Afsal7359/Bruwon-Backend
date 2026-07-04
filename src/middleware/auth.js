import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export async function protect(req, res, next) {
  try {
    let token;
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) token = header.slice(7);
    if (!token && req.cookies?.token) token = req.cookies.token;

    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: 'Not authorized, admin not found' });

    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
}
