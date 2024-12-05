"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const router = express_1.default.Router();
// GET user profile
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const user = await User_1.User.findByPk(req.user.id, {
            attributes: {
                exclude: ['password'],
                include: [
                    'id',
                    'username',
                    'email',
                    'dayCount',
                    'createdAt',
                    'updatedAt'
                ]
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).json({
            message: "Error retrieving user profile",
            error: error.message
        });
    }
});
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
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
        const userWithoutPassword = user.toJSON();
        delete userWithoutPassword.password;
        res.json({
            message: "Login successful",
            user: userWithoutPassword,
            token
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
// POST a new user (registration)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }
        // Check if user already exists
        const existingUser = await User_1.User.findOne({
            where: {
                [sequelize_1.Op.or]: [{ username }, { email }]
            }
        });
        if (existingUser) {
            return res.status(409).json({ message: "Username or email already exists" });
        }
        const newUser = await User_1.User.create({ username, email, password });
        const userWithoutPassword = newUser.toJSON();
        delete userWithoutPassword.password;
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
        res.status(201).json({
            message: "User registered successfully",
            user: userWithoutPassword,
            token
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
// GET friend's profile
router.get('/:friendId', auth_1.authenticateToken, async (req, res) => {
    try {
        const friendId = req.params.friendId;
        const friend = await User_1.User.findByPk(friendId, {
            attributes: {
                exclude: ['password'],
                include: [
                    'id',
                    'username',
                    'email',
                    'dayCount',
                    'createdAt',
                    'updatedAt'
                ]
            }
        });
        if (!friend) {
            return res.status(404).json({ message: "Friend not found" });
        }
        res.json(friend);
    }
    catch (error) {
        console.error('Error retrieving friend profile:', error);
        res.status(500).json({
            message: "Error retrieving friend profile",
            error: error.message
        });
    }
});
exports.default = router;
