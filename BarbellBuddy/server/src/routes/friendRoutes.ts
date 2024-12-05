import express from 'express';
import { Friend } from '../models/Friend';
import { User } from '../models/User';
import { Lift } from '../models/Lift';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

const router = express.Router();

// GET user's friends with details
router.get('/details', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const userFriends = await Friend.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'friend',
          attributes: ['id', 'username', 'registrationDate'],
          include: [
            {
              model: Lift,
              limit: 1,
              order: [['date', 'DESC']],
              attributes: ['type', 'weight', 'reps', 'sets', 'date'],
            },
          ],
        },
      ],
    });

    const friendsWithDetails = await Promise.all(
      userFriends.map(async (friend) => {
        const maxLifts = await Lift.findAll({
          where: { userId: friend.friendId },
          attributes: [
            'type',
            [Lift.sequelize!.fn('MAX', Lift.sequelize!.col('weight')), 'maxWeight'],
          ],
          group: ['type'],
        });

        return {
          id: friend.id,
          friendId: friend.friendId,
          friendUsername: friend.friendUsername,
          registrationDate: friend.friend.registrationDate,
          lastLift: friend.friend.lifts[0] || null,
          maxLifts: maxLifts.reduce((acc: { [key: string]: number }, lift: any) => {
            acc[lift.type] = lift.getDataValue('maxWeight');
            return acc;
          }, {}),
        };
      })
    );

    res.json(friendsWithDetails);
  } catch (error) {
    console.error('Error retrieving friend details:', error);
    res.status(500).json({ 
      message: "Error retrieving friend details", 
      error: (error as Error).message 
    });
  }
});

// GET user's friends
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const userFriends = await Friend.findAll({
      where: { 
        userId: req.user.id 
      },
      attributes: ['id', 'friendId', 'friendUsername'],
    });

    res.json(userFriends);
  } catch (error) {
    console.error('Error retrieving friends:', error);
    res.status(500).json({ 
      message: "Error retrieving friends", 
      error: (error as Error).message 
    });
  }
});

// Add new friend
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const { friendUsername } = req.body;
    
    console.log('Received friendUsername:', friendUsername);

    if (!friendUsername || typeof friendUsername !== 'string') {
      return res.status(400).json({ 
        message: "Friend username is required and must be a string" 
      });
    }

    // Check if friend exists
    const friendUser = await User.findOne({ where: { username: friendUsername } });
    if (!friendUser) {
      return res.status(404).json({ 
        message: "User not found with the provided username" 
      });
    }

    // Check if trying to add self
    if (friendUser.id === req.user.id) {
      return res.status(400).json({ 
        message: "Cannot add yourself as a friend" 
      });
    }

    // Check if friendship already exists
    const existingFriend = await Friend.findOne({
      where: {
        [Op.or]: [
          { userId: req.user.id, friendId: friendUser.id },
          { userId: friendUser.id, friendId: req.user.id }
        ]
      }
    });

    if (existingFriend) {
      return res.status(400).json({ 
        message: "Friend relationship already exists" 
      });
    }

    // Get the current user's username
    const currentUser = await User.findByPk(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    // Create mutual friend relationships
    const [newFriend1, newFriend2] = await Promise.all([
      Friend.create({
        userId: req.user.id,
        friendId: friendUser.id,
        friendUsername: friendUser.username
      }),
      Friend.create({
        userId: friendUser.id,
        friendId: req.user.id,
        friendUsername: currentUser.username
      })
    ]);

    // Fetch last lift and max lifts for the new friend
    const lastLift = await Lift.findOne({
      where: { userId: friendUser.id },
      order: [['date', 'DESC']],
    });

    const maxLifts = await Lift.findAll({
      where: { userId: friendUser.id },
      attributes: [
        'type',
        [Lift.sequelize!.fn('MAX', Lift.sequelize!.col('weight')), 'maxWeight'],
      ],
      group: ['type'],
    });

    const maxLiftsObject = maxLifts.reduce((acc: { [key: string]: number }, lift: any) => {
      acc[lift.type] = lift.getDataValue('maxWeight');
      return acc;
    }, {});

    res.status(201).json({
      id: newFriend1.id,
      friendId: newFriend1.friendId,
      friendUsername: newFriend1.friendUsername,
      registrationDate: friendUser.createdAt,
      lastLift: lastLift,
      maxLifts: maxLiftsObject
    });
  } catch (error) {
    console.error('Error creating friend relationship:', error);
    res.status(500).json({ 
      message: "Error creating friend relationship", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;

