import express from 'express';
import { Group, UserGroup } from '../models/Group';
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

    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Group,
          as: 'groups',
          through: { attributes: [] }
        },
        {
          model: Group,
          as: 'createdGroups'
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const groups = [...user.groups, ...user.createdGroups];
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

    const newGroup = await Group.create({
      name: req.body.name,
      creatorId: req.user.id
    });

    await UserGroup.create({
      userId: req.user.id,
      groupId: newGroup.id
    });

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
    const group = await Group.findByPk(req.params.groupId);

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

    await UserGroup.create({
      userId: userToAdd.id,
      groupId: group.id
    });

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

    const group = await Group.findByPk(req.params.groupId, {
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

export default router;

