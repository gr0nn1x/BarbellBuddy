import express from 'express';
import { Program } from '../models/Program';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET user's programs
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const programs = await Program.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(programs);
  } catch (error) {
    console.error('Error retrieving programs:', error);
    res.status(500).json({ 
      message: "Error retrieving programs", 
      error: (error as Error).message 
    });
  }
});

// GET a single program
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const program = await Program.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (program) {
      res.json(program);
    } else {
      res.status(404).json({ message: "Program not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving program", error });
  }
});

// POST a new program
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const newProgram = await Program.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(newProgram);
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(400).json({ 
      message: "Error creating program", 
      error: (error as Error).message 
    });
  }
});

// PUT to update a program
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const [updated] = await Program.update(req.body, {
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (updated) {
      const updatedProgram = await Program.findOne({
        where: { 
          id: req.params.id,
          userId: req.user.id
        }
      });
      res.json(updatedProgram);
    } else {
      res.status(404).json({ message: "Program not found or unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error updating program", error });
  }
});

// DELETE a program
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const deleted = await Program.destroy({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (deleted) {
      res.status(204).send("Program deleted");
    } else {
      res.status(404).json({ message: "Program not found or unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting program", error });
  }
});

export default router;

