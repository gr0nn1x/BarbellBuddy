"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Group_1 = require("../models/Group");
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
        const user = await User_1.User.findByPk(req.user.id, {
            include: [
                {
                    model: Group_1.Group,
                    as: 'groups',
                    through: { attributes: [] }
                },
                {
                    model: Group_1.Group,
                    as: 'createdGroups'
                }
            ]
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const groups = [...user.groups, ...user.createdGroups];
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
        const newGroup = await Group_1.Group.create({
            name: req.body.name,
            creatorId: req.user.id
        });
        await Group_1.UserGroup.create({
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
        const group = await Group_1.Group.findByPk(req.params.groupId);
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
        await Group_1.UserGroup.create({
            userId: userToAdd.id,
            groupId: group.id
        });
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
        const group = await Group_1.Group.findByPk(req.params.groupId, {
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
exports.default = router;
