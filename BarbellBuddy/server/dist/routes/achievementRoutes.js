"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Achievement_1 = require("../models/Achievement");
const router = express_1.default.Router();
// GET all achievements
router.get('/', async (req, res) => {
    try {
        const achievements = await Achievement_1.Achievement.findAll();
        res.json(achievements);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving achievements", error });
    }
});
// GET a single achievement
router.get('/:id', async (req, res) => {
    try {
        const achievement = await Achievement_1.Achievement.findByPk(req.params.id);
        if (achievement) {
            res.json(achievement);
        }
        else {
            res.status(404).json({ message: "Achievement not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving achievement", error });
    }
});
// POST a new achievement
router.post('/', async (req, res) => {
    try {
        const newAchievement = await Achievement_1.Achievement.create(req.body);
        res.status(201).json(newAchievement);
    }
    catch (error) {
        res.status(400).json({ message: "Error creating achievement", error });
    }
});
// PUT to update an achievement
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await Achievement_1.Achievement.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedAchievement = await Achievement_1.Achievement.findByPk(req.params.id);
            res.json(updatedAchievement);
        }
        else {
            res.status(404).json({ message: "Achievement not found" });
        }
    }
    catch (error) {
        res.status(400).json({ message: "Error updating achievement", error });
    }
});
// PATCH to partially update an achievement
router.patch('/:id', async (req, res) => {
    try {
        const [updated] = await Achievement_1.Achievement.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedAchievement = await Achievement_1.Achievement.findByPk(req.params.id);
            res.json(updatedAchievement);
        }
        else {
            res.status(404).json({ message: "Achievement not found" });
        }
    }
    catch (error) {
        res.status(400).json({ message: "Error updating achievement", error });
    }
});
// DELETE an achievement
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Achievement_1.Achievement.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send("Achievement deleted");
        }
        else {
            res.status(404).json({ message: "Achievement not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting achievement", error });
    }
});
exports.default = router;
