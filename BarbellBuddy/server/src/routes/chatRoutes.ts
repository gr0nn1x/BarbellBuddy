import express from 'express';
import { Chat } from '../models/Chat';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

const router = express.Router();

// Get chat history between two users
router.get('/:friendId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const { friendId } = req.params;

    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id, receiverId: friendId },
          { senderId: friendId, receiverId: req.user.id }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    res.json(chats);
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    res.status(500).json({ 
      message: "Error retrieving chat history",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;

