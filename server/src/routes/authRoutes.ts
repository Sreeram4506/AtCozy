import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({ email, name, password });
    await newUser.save();
    
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: newUser._id, email: newUser.email, name: newUser.name } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, wishlist: user.wishlist } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
