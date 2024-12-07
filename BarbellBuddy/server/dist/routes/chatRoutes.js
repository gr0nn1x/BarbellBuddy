"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Chat_1 = require("../models/Chat");
const auth_1 = require("../middleware/auth");
const sequelize_1 = require("sequelize");
const router = express_1.default.Router();
// Get chat history between two users
router.get('/:friendId', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const { friendId } = req.params;
        const chats = await Chat_1.Chat.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { senderId: req.user.id, receiverId: friendId },
                    { senderId: friendId, receiverId: req.user.id }
                ]
            },
            order: [['createdAt', 'ASC']]
        });
        res.json(chats);
    }
    catch (error) {
        console.error("Error retrieving chat history:", error);
        res.status(500).json({
            message: "Error retrieving chat history",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.default = router;
