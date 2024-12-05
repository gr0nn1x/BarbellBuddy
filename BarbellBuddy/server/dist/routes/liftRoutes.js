"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Lift_1 = require("../models/Lift");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// GET user's lifts
router.get('/', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const lifts = await Lift_1.Lift.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']]
        });
        res.json(lifts);
    }
    catch (error) {
        console.error('Error retrieving lifts:', error);
        res.status(500).json({
            message: "Error retrieving lifts",
            error: error.message
        });
    }
});
// GET user's last lift
router.get('/last', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const lastLift = await Lift_1.Lift.findOne({
            where: { userId: req.user.id },
            order: [['date', 'DESC']],
        });
        if (lastLift) {
            res.json(lastLift);
        }
        else {
            res.status(404).json({ message: "No lifts found for this user" });
        }
    }
    catch (error) {
        console.error('Error retrieving last lift:', error);
        res.status(500).json({
            message: "Error retrieving last lift",
            error: error.message
        });
    }
});
// GET user's max lifts
router.get('/max', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const maxLifts = await Lift_1.Lift.findAll({
            where: { userId: req.user.id },
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
        res.json(maxLiftsObject);
    }
    catch (error) {
        console.error('Error retrieving max lifts:', error);
        res.status(500).json({
            message: "Error retrieving max lifts",
            error: error.message
        });
    }
});
// GET a single lift
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const lift = await Lift_1.Lift.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (lift) {
            res.json(lift);
        }
        else {
            res.status(404).json({ message: "Lift not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving lift", error });
    }
});
// POST a new lift
router.post('/', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const newLift = await Lift_1.Lift.create({
            ...req.body,
            userId: req.user.id,
            date: new Date()
        });
        res.status(201).json(newLift);
    }
    catch (error) {
        console.error('Error creating lift:', error);
        res.status(400).json({
            message: "Error creating lift",
            error: error.message
        });
    }
});
// PUT to update a lift
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const [updated] = await Lift_1.Lift.update(req.body, {
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (updated) {
            const updatedLift = await Lift_1.Lift.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });
            res.json(updatedLift);
        }
        else {
            res.status(404).json({ message: "Lift not found or unauthorized" });
        }
    }
    catch (error) {
        res.status(400).json({ message: "Error updating lift", error });
    }
});
// DELETE a lift
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const deleted = await Lift_1.Lift.destroy({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (deleted) {
            res.status(204).send("Lift deleted");
        }
        else {
            res.status(404).json({ message: "Lift not found or unauthorized" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting lift", error });
    }
});
exports.default = router;
