import express from "express";
import { User } from "../models/User";
import { authenticateToken } from "../middleware/auth";
import { AuthRequest } from "../middleware/auth";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

const router = express.Router();

// GET user profile
router.get("/profile", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ["password"],
        include: [
          "id",
          "username",
          "email",
          "dayCount",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({
      message: "Error retrieving user profile",
      error: (error as Error).message,
    });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    const userWithoutPassword = { ...user.toJSON() };
    delete (userWithoutPassword as any).password;
    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error during login",
      error: (error as Error).message,
    });
  }
});

//verify for chat
router.get("/verify", authenticateToken, (req: AuthRequest, res) => {
  res.status(200).json({ valid: true });
});

// POST a new user (registration)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    const newUser = await User.create({ username, email, password });
    const userWithoutPassword = { ...newUser.toJSON() };
    delete (userWithoutPassword as any).password;

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error during registration",
      error: (error as Error).message,
    });
  }
});

// GET friend's profile
router.get("/:friendId", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const friendId = req.params.friendId;
    const friend = await User.findByPk(friendId, {
      attributes: {
        exclude: ["password"],
        include: [
          "id",
          "username",
          "email",
          "dayCount",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    res.json(friend);
  } catch (error) {
    console.error("Error retrieving friend profile:", error);
    res.status(500).json({
      message: "Error retrieving friend profile",
      error: (error as Error).message,
    });
  }
});

export default router;
