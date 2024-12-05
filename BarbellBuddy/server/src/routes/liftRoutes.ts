import express from 'express';
import { Lift } from '../models/Lift';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

const router = express.Router();

// GET user's lifts
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const lifts = await Lift.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']]
    });
    res.json(lifts);
  } catch (error) {
    console.error('Error retrieving lifts:', error);
    res.status(500).json({ 
      message: "Error retrieving lifts", 
      error: (error as Error).message 
    });
  }
});

// GET user's last lift
router.get('/last', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const lastLift = await Lift.findOne({
      where: { userId: req.user.id },
      order: [['date', 'DESC']],
    });

    if (lastLift) {
      res.json(lastLift);
    } else {
      res.status(404).json({ message: "No lifts found for this user" });
    }
  } catch (error) {
    console.error('Error retrieving last lift:', error);
    res.status(500).json({ 
      message: "Error retrieving last lift", 
      error: (error as Error).message 
    });
  }
});

// GET user's max lifts
router.get('/max', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const maxLifts = await Lift.findAll({
      where: { userId: req.user.id },
      attributes: [
        'type',
        [Lift.sequelize!.fn('MAX', Lift.sequelize!.col('weight')), 'maxWeight'],
      ],
      group: ['type'],
    });

    const maxLiftsObject = maxLifts.reduce((acc: { [key: string]: number }, lift: any) => {
      acc[lift.type] = lift.getDataValue('maxWeight');
      return acc;
    }, {});

    res.json(maxLiftsObject);
  } catch (error) {
    console.error('Error retrieving max lifts:', error);
    res.status(500).json({ 
      message: "Error retrieving max lifts", 
      error: (error as Error).message 
    });
  }
});

// GET a single lift
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const lift = await Lift.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (lift) {
      res.json(lift);
    } else {
      res.status(404).json({ message: "Lift not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving lift", error });
  }
});

// POST a new lift
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const newLift = await Lift.create({
      ...req.body,
      userId: req.user.id,
      date: new Date()
    });
    res.status(201).json(newLift);
  } catch (error) {
    console.error('Error creating lift:', error);
    res.status(400).json({ 
      message: "Error creating lift", 
      error: (error as Error).message 
    });
  }
});

// PUT to update a lift
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const [updated] = await Lift.update(req.body, {
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (updated) {
      const updatedLift = await Lift.findOne({
        where: { 
          id: req.params.id,
          userId: req.user.id
        }
      });
      res.json(updatedLift);
    } else {
      res.status(404).json({ message: "Lift not found or unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error updating lift", error });
  }
});

// DELETE a lift
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const deleted = await Lift.destroy({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (deleted) {
      res.status(204).send("Lift deleted");
    } else {
      res.status(404).json({ message: "Lift not found or unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting lift", error });
  }
});

export default router;

