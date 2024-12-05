"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Friend_1 = require("../models/Friend");
const User_1 = require("../models/User");
const Lift_1 = require("../models/Lift");
const auth_1 = require("../middleware/auth");
const sequelize_1 = require("sequelize");
const router = express_1.default.Router();
// GET user's friends with details
router.get('/details', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const userFriends = await Friend_1.Friend.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: User_1.User,
                    as: 'friend',
                    attributes: ['id', 'username', 'registrationDate'],
                    include: [
                        {
                            model: Lift_1.Lift,
                            limit: 1,
                            order: [['date', 'DESC']],
                            attributes: ['type', 'weight', 'reps', 'sets', 'date'],
                        },
                    ],
                },
            ],
        });
        const friendsWithDetails = await Promise.all(userFriends.map(async (friend) => {
            const maxLifts = await Lift_1.Lift.findAll({
                where: { userId: friend.friendId },
                attributes: [
                    'type',
                    [Lift_1.Lift.sequelize.fn('MAX', Lift_1.Lift.sequelize.col('weight')), 'maxWeight'],
                ],
                group: ['type'],
            });
            return {
                id: friend.id,
                friendId: friend.friendId,
                friendUsername: friend.friendUsername,
                registrationDate: friend.friend.registrationDate,
                lastLift: friend.friend.lifts[0] || null,
                maxLifts: maxLifts.reduce((acc, lift) => {
                    acc[lift.type] = lift.getDataValue('maxWeight');
                    return acc;
                }, {}),
            };
        }));
        res.json(friendsWithDetails);
    }
    catch (error) {
        console.error('Error retrieving friend details:', error);
        res.status(500).json({
            message: "Error retrieving friend details",
            error: error.message
        });
    }
});
// GET user's friends
router.get('/', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const userFriends = await Friend_1.Friend.findAll({
            where: {
                userId: req.user.id
            },
            attributes: ['id', 'friendId', 'friendUsername'],
        });
        res.json(userFriends);
    }
    catch (error) {
        console.error('Error retrieving friends:', error);
        res.status(500).json({
            message: "Error retrieving friends",
            error: error.message
        });
    }
});
// Add new friend
router.post('/', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
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
        const friendUser = await User_1.User.findOne({ where: { username: friendUsername } });
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
        const existingFriend = await Friend_1.Friend.findOne({
            where: {
                [sequelize_1.Op.or]: [
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
        const currentUser = await User_1.User.findByPk(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found" });
        }
        // Create mutual friend relationships
        const [newFriend1, newFriend2] = await Promise.all([
            Friend_1.Friend.create({
                userId: req.user.id,
                friendId: friendUser.id,
                friendUsername: friendUser.username
            }),
            Friend_1.Friend.create({
                userId: friendUser.id,
                friendId: req.user.id,
                friendUsername: currentUser.username
            })
        ]);
        // Fetch last lift and max lifts for the new friend
        const lastLift = await Lift_1.Lift.findOne({
            where: { userId: friendUser.id },
            order: [['date', 'DESC']],
        });
        const maxLifts = await Lift_1.Lift.findAll({
            where: { userId: friendUser.id },
            attributes: [
                'type',
                [Lift_1.Lift.sequelize.fn('MAX', Lift_1.Lift.sequelize.col('weight')), 'maxWeight'],
            ],
            group: ['type'],
        });
        const maxLiftsObject = maxLifts.reduce((acc, lift) => {
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
    }
    catch (error) {
        console.error('Error creating friend relationship:', error);
        res.status(500).json({
            message: "Error creating friend relationship",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.default = router;
