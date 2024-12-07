"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Friend_1 = require("../models/Friend");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const Lift_1 = require("../models/Lift");
const sequelize_1 = require("sequelize");
const router = express_1.default.Router();
// GET user's friends
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userFriends = await Friend_1.Friend.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: User_1.User,
                    as: 'friend',
                    attributes: ['id', 'username', 'email', 'createdAt'],
                    include: [
                        {
                            model: Lift_1.Lift,
                            attributes: ['type', 'weight', 'reps', 'sets', 'date'],
                            limit: 1,
                            order: [['date', 'DESC']],
                        },
                    ],
                },
            ],
        });
        const friendsWithDetails = await Promise.all(userFriends.map(async (friendship) => {
            const friendUser = friendship.friend;
            const maxLifts = await Lift_1.Lift.findAll({
                where: { userId: friendUser.id },
                attributes: [
                    'type',
                    [Lift_1.Lift.sequelize.fn('MAX', Lift_1.Lift.sequelize.col('weight')), 'maxWeight'],
                ],
                group: ['type'],
            });
            return {
                id: friendship.id,
                friendId: friendUser.id,
                friendUsername: friendUser.username,
                registrationDate: friendUser.createdAt,
                lastLift: friendUser.lifts[0] || null,
                maxLifts: maxLifts.reduce((acc, lift) => {
                    acc[lift.type] = lift.getDataValue('maxWeight');
                    return acc;
                }, {}),
            };
        }));
        res.json(friendsWithDetails);
    }
    catch (error) {
        console.error('Error retrieving friends:', error);
        res.status(500).json({ message: "Error retrieving friends", error: error.message });
    }
});
// Add new friend
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { friendUsername } = req.body;
        // Find the friend user
        const friendUser = await User_1.User.findOne({ where: { username: friendUsername } });
        if (!friendUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // Check if friendship already exists
        const existingFriend = await Friend_1.Friend.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { userId: req.user.id, friendId: friendUser.id },
                    { userId: friendUser.id, friendId: req.user.id }
                ]
            }
        });
        if (existingFriend) {
            return res.status(400).json({ message: "Friend relationship already exists" });
        }
        // Create new friendship
        const newFriend = await Friend_1.Friend.create({
            userId: req.user.id,
            friendId: friendUser.id
        });
        // Create reverse friendship
        await Friend_1.Friend.create({
            userId: friendUser.id,
            friendId: req.user.id
        });
        const friendDetails = {
            id: newFriend.id,
            friendId: friendUser.id,
            friendUsername: friendUser.username,
            registrationDate: friendUser.createdAt,
            lastLift: null,
            maxLifts: {},
        };
        res.status(201).json(friendDetails);
    }
    catch (error) {
        console.error('Error creating friend relationship:', error);
        res.status(400).json({ message: "Error creating friend relationship", error: error.message });
    }
});
exports.default = router;
