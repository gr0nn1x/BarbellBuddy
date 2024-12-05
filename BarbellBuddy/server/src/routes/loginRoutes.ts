import express from 'express';
import { User } from '../models/User';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;
    
    res.json({ message: "Login successful", user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: "Error during login", error });
  }
});

export default router;

