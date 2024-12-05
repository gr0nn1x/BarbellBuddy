"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ where: { email } });
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
    }
    catch (error) {
        res.status(500).json({ message: "Error during login", error });
    }
});
exports.default = router;
