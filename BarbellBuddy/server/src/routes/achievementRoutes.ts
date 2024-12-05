import express from 'express';
import { Achievement } from '../models/Achievement';

const router = express.Router();

// GET all achievements
router.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.findAll();
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving achievements", error });
  }
});

// GET a single achievement
router.get('/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findByPk(req.params.id);
    if (achievement) {
      res.json(achievement);
    } else {
      res.status(404).json({ message: "Achievement not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving achievement", error });
  }
});

// POST a new achievement
router.post('/', async (req, res) => {
  try {
    const newAchievement = await Achievement.create(req.body);
    res.status(201).json(newAchievement);
  } catch (error) {
    res.status(400).json({ message: "Error creating achievement", error });
  }
});

// PUT to update an achievement
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Achievement.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedAchievement = await Achievement.findByPk(req.params.id);
      res.json(updatedAchievement);
    } else {
      res.status(404).json({ message: "Achievement not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error updating achievement", error });
  }
});

// PATCH to partially update an achievement
router.patch('/:id', async (req, res) => {
  try {
    const [updated] = await Achievement.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedAchievement = await Achievement.findByPk(req.params.id);
      res.json(updatedAchievement);
    } else {
      res.status(404).json({ message: "Achievement not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error updating achievement", error });
  }
});

// DELETE an achievement
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Achievement.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send("Achievement deleted");
    } else {
      res.status(404).json({ message: "Achievement not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting achievement", error });
  }
});

export default router;

