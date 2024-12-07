"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = express_1.default.Router();
// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User_1.User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
        const userWithoutPassword = user.toJSON();
        delete userWithoutPassword.password;
        res.json({
            message: "Login successful",
            user: userWithoutPassword,
            token,
            userId: user.id // Explicitly including userId in the response
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: "Error during login",
            error: error.message
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
        const existingUser = await User_1.User.findOne({
            where: {
                [sequelize_1.Op.or]: [{ username }, { email }]
            }
        });
        if (existingUser) {
            return res.status(409).json({ message: "Username or email already exists" });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await User_1.User.create({
            username,
            email,
            password: hashedPassword
        });
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
        const userWithoutPassword = newUser.toJSON();
        delete userWithoutPassword.password;
        res.status(201).json({
            message: "User registered successfully",
            user: userWithoutPassword,
            token,
            userId: newUser.id // Explicitly including userId in the response
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: "Error during registration",
            error: error.message
        });
    }
});
exports.default = router;
