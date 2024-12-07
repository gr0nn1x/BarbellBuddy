import express from 'express';
import { Friend } from '../models/Friend';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { Lift } from '../models/Lift';
import { Op } from 'sequelize';

const router = express.Router();

// GET user's friends
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userFriends = await Friend.findAll({
      where: { userId: req.user!.id },
      include: [
        {
          model: User,
          as: 'friend',
          attributes: ['id', 'username', 'email', 'createdAt'],
          include: [
            {
              model: Lift,
              attributes: ['type', 'weight', 'reps', 'sets', 'date'],
              limit: 1,
              order: [['date', 'DESC']],
            },
          ],
        },
      ],
    });

    const friendsWithDetails = await Promise.all(
      userFriends.map(async (friendship) => {
        const friendUser = friendship.friend;

        const maxLifts = await Lift.findAll({
          where: { userId: friendUser.id },
          attributes: [
            'type',
            [Lift.sequelize!.fn('MAX', Lift.sequelize!.col('weight')), 'maxWeight'],
          ],
          group: ['type'],
        });

        return {
          id: friendship.id,
          friendId: friendUser.id,
          friendUsername: friendUser.username,
          registrationDate: friendUser.createdAt,
          lastLift: friendUser.lifts[0] || null,
          maxLifts: maxLifts.reduce((acc: { [key: string]: number }, lift: any) => {
            acc[lift.type] = lift.getDataValue('maxWeight');
            return acc;
          }, {}),
        };
      })
    );

    res.json(friendsWithDetails);
  } catch (error) {
    console.error('Error retrieving friends:', error);
    res.status(500).json({ message: "Error retrieving friends", error: (error as Error).message });
  }
});

// Add new friend
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { friendUsername } = req.body;
    
    // Find the friend user
    const friendUser = await User.findOne({ where: { username: friendUsername } });
    
    if (!friendUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if friendship already exists
    const existingFriend = await Friend.findOne({
      where: {
        [Op.or]: [
          { userId: req.user!.id, friendId: friendUser.id },
          { userId: friendUser.id, friendId: req.user!.id }
        ]
      }
    });

    if (existingFriend) {
      return res.status(400).json({ message: "Friend relationship already exists" });
    }

    // Create new friendship
    const newFriend = await Friend.create({
      userId: req.user!.id,
      friendId: friendUser.id
    } as Friend);

    // Create reverse friendship
    await Friend.create({
      userId: friendUser.id,
      friendId: req.user!.id
    } as Friend);

    const friendDetails = {
      id: newFriend.id,
      friendId: friendUser.id,
      friendUsername: friendUser.username,
      registrationDate: friendUser.createdAt,
      lastLift: null,
      maxLifts: {},
    };

    res.status(201).json(friendDetails);
  } catch (error) {
    console.error('Error creating friend relationship:', error);
    res.status(400).json({ message: "Error creating friend relationship", error: (error as Error).message });
  }
});

export default router;

