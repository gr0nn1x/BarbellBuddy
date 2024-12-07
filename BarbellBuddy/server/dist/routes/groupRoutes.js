"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Group_1 = require("../models/Group");
const UserGroup_1 = require("../models/UserGroup");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// GET user's groups
router.get('/', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const userGroups = await UserGroup_1.UserGroup.findAll({
            where: { userId: req.user.id },
            include: [{ model: Group_1.Group }]
        });
        const createdGroups = await Group_1.Group.findAll({
            where: { creatorId: req.user.id }
        });
        const groups = [
            ...userGroups.map(ug => ug.groupId),
            ...createdGroups
        ];
        res.json(groups);
    }
    catch (error) {
        console.error('Error retrieving groups:', error);
        res.status(500).json({
            message: "Error retrieving groups",
            error: error.message
        });
    }
});
// POST a new group
router.post('/', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const { name } = req.body;
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: "Group name is required and must be a string" });
        }
        const newGroup = await Group_1.Group.create({
            name: name,
            creatorId: req.user.id
        });
        await UserGroup_1.UserGroup.create({
            userId: req.user.id,
            groupId: newGroup.id
        });
        res.status(201).json(newGroup);
    }
    catch (error) {
        console.error('Error creating group:', error);
        res.status(400).json({
            message: "Error creating group",
            error: error.message
        });
    }
});
// POST add user to group
router.post('/:groupId/users', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const { username } = req.body;
        const groupId = parseInt(req.params.groupId);
        if (isNaN(groupId)) {
            return res.status(400).json({ message: "Invalid group ID" });
        }
        const group = await Group_1.Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        if (group.creatorId !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to add users to this group" });
        }
        const userToAdd = await User_1.User.findOne({ where: { username } });
        if (!userToAdd) {
            return res.status(404).json({ message: "User not found" });
        }
        const [userGroup, created] = await UserGroup_1.UserGroup.findOrCreate({
            where: {
                userId: userToAdd.id,
                groupId: group.id
            }
        });
        if (!created) {
            return res.status(400).json({ message: "User is already in the group" });
        }
        res.status(201).json({ message: "User added to group successfully" });
    }
    catch (error) {
        console.error('Error adding user to group:', error);
        res.status(400).json({
            message: "Error adding user to group",
            error: error.message
        });
    }
});
// GET group details
router.get('/:groupId', auth_1.authenticateToken, async (req, res) => {
    var _a, _b;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const groupId = parseInt(req.params.groupId);
        if (isNaN(groupId)) {
            return res.status(400).json({ message: "Invalid group ID" });
        }
        const group = await Group_1.Group.findByPk(groupId, {
            include: [
                {
                    model: User_1.User,
                    as: 'members',
                    through: { attributes: [] },
                    attributes: ['id', 'username']
                },
                {
                    model: User_1.User,
                    as: 'creator',
                    attributes: ['id', 'username']
                }
            ]
        });
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        // Check if the user is a member of the group
        const isMember = group.members.some(member => { var _a; return member.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); }) || group.creatorId === ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!isMember) {
            return res.status(403).json({ message: "Not authorized to view this group" });
        }
        res.json(group);
    }
    catch (error) {
        console.error('Error retrieving group details:', error);
        res.status(500).json({
            message: "Error retrieving group details",
            error: error.message
        });
    }
});
// DELETE remove user from group
router.delete('/:groupId/users/:userId', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const groupId = parseInt(req.params.groupId);
        const userIdToRemove = parseInt(req.params.userId);
        if (isNaN(groupId) || isNaN(userIdToRemove)) {
            return res.status(400).json({ message: "Invalid group ID or user ID" });
        }
        const group = await Group_1.Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        if (group.creatorId !== req.user.id && req.user.id !== userIdToRemove) {
            return res.status(403).json({ message: "Not authorized to remove users from this group" });
        }
        const deleted = await UserGroup_1.UserGroup.destroy({
            where: {
                userId: userIdToRemove,
                groupId: group.id
            }
        });
        if (deleted === 0) {
            return res.status(404).json({ message: "User is not in the group" });
        }
        res.status(200).json({ message: "User removed from group successfully" });
    }
    catch (error) {
        console.error('Error removing user from group:', error);
        res.status(400).json({
            message: "Error removing user from group",
            error: error.message
        });
    }
});
exports.default = router;
