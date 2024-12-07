import express from 'express';
import { Group } from '../models/Group';
import { UserGroup } from '../models/UserGroup';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET user's groups
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const userGroups = await UserGroup.findAll({
      where: { userId: req.user.id },
      include: [{ model: Group }]
    });

    const createdGroups = await Group.findAll({
      where: { creatorId: req.user.id }
    });

    const groups = [
      ...userGroups.map(ug => ug.groupId),
      ...createdGroups
    ];

    res.json(groups);
  } catch (error) {
    console.error('Error retrieving groups:', error);
    res.status(500).json({ 
      message: "Error retrieving groups", 
      error: (error as Error).message 
    });
  }
});

// POST a new group
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: "Group name is required and must be a string" });
    }

    const newGroup = await Group.create({
      name: name,
      creatorId: req.user.id
    } as Group);

    await UserGroup.create({
      userId: req.user.id,
      groupId: newGroup.id
    } as UserGroup);

    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(400).json({ 
      message: "Error creating group", 
      error: (error as Error).message 
    });
  }
});

// POST add user to group
router.post('/:groupId/users', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const { username } = req.body;
    const groupId = parseInt(req.params.groupId);

    if (isNaN(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.creatorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to add users to this group" });
    }

    const userToAdd = await User.findOne({ where: { username } });

    if (!userToAdd) {
      return res.status(404).json({ message: "User not found" });
    }

    const [userGroup, created] = await UserGroup.findOrCreate({
      where: {
        userId: userToAdd.id,
        groupId: group.id
      }
    });

    if (!created) {
      return res.status(400).json({ message: "User is already in the group" });
    }

    res.status(201).json({ message: "User added to group successfully" });
  } catch (error) {
    console.error('Error adding user to group:', error);
    res.status(400).json({ 
      message: "Error adding user to group", 
      error: (error as Error).message 
    });
  }
});

// GET group details
router.get('/:groupId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const groupId = parseInt(req.params.groupId);

    if (isNaN(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'members',
          through: { attributes: [] },
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        }
      ]
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is a member of the group
    const isMember = group.members.some(member => member.id === req.user?.id) || group.creatorId === req.user?.id;

    if (!isMember) {
      return res.status(403).json({ message: "Not authorized to view this group" });
    }

    res.json(group);
  } catch (error) {
    console.error('Error retrieving group details:', error);
    res.status(500).json({ 
      message: "Error retrieving group details", 
      error: (error as Error).message 
    });
  }
});

// DELETE remove user from group
router.delete('/:groupId/users/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const groupId = parseInt(req.params.groupId);
    const userIdToRemove = parseInt(req.params.userId);

    if (isNaN(groupId) || isNaN(userIdToRemove)) {
      return res.status(400).json({ message: "Invalid group ID or user ID" });
    }

    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.creatorId !== req.user.id && req.user.id !== userIdToRemove) {
      return res.status(403).json({ message: "Not authorized to remove users from this group" });
    }

    const deleted = await UserGroup.destroy({
      where: {
        userId: userIdToRemove,
        groupId: group.id
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: "User is not in the group" });
    }

    res.status(200).json({ message: "User removed from group successfully" });
  } catch (error) {
    console.error('Error removing user from group:', error);
    res.status(400).json({ 
      message: "Error removing user from group", 
      error: (error as Error).message 
    });
  }
});

export default router;

