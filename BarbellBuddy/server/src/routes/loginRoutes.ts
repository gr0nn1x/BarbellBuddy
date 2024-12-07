import express from 'express';
import { Op } from 'sequelize';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    const userWithoutPassword = user.toJSON();
    delete (userWithoutPassword as any).password;
    
    res.json({ 
      message: "Login successful", 
      user: userWithoutPassword, 
      token,
      userId: user.id // Explicitly including userId in the response
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: "Error during login", 
      error: (error as Error).message 
    });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ username }, { email }] 
      } 
    });

    if (existingUser) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    const userWithoutPassword = newUser.toJSON();
    delete (userWithoutPassword as any).password;

    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
      token,
      userId: newUser.id // Explicitly including userId in the response
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: "Error during registration", 
      error: (error as Error).message 
    });
  }
});

export default router;

