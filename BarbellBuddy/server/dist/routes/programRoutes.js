"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Program_1 = require("../models/Program");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// GET user's programs
router.get('/', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const programs = await Program_1.Program.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(programs);
    }
    catch (error) {
        console.error('Error retrieving programs:', error);
        res.status(500).json({
            message: "Error retrieving programs",
            error: error.message
        });
    }
});
// GET a single program
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const program = await Program_1.Program.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (program) {
            res.json(program);
        }
        else {
            res.status(404).json({ message: "Program not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving program", error });
    }
});
// POST a new program
router.post('/', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const newProgram = await Program_1.Program.create({
            ...req.body,
            userId: req.user.id
        });
        res.status(201).json(newProgram);
    }
    catch (error) {
        console.error('Error creating program:', error);
        res.status(400).json({
            message: "Error creating program",
            error: error.message
        });
    }
});
// PUT to update a program
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const [updated] = await Program_1.Program.update(req.body, {
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (updated) {
            const updatedProgram = await Program_1.Program.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });
            res.json(updatedProgram);
        }
        else {
            res.status(404).json({ message: "Program not found or unauthorized" });
        }
    }
    catch (error) {
        res.status(400).json({ message: "Error updating program", error });
    }
});
// DELETE a program
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const deleted = await Program_1.Program.destroy({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (deleted) {
            res.status(204).send("Program deleted");
        }
        else {
            res.status(404).json({ message: "Program not found or unauthorized" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting program", error });
    }
});
exports.default = router;
