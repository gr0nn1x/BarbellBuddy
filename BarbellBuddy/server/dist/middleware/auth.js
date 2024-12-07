"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
            req.user = decoded;
            req.userId = decoded.id;
            next();
        });
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Authentication error', error: error.message });
    }
};
exports.authenticateToken = authenticateToken;
