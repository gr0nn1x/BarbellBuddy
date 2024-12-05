"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./config/database"));
async function initializeDatabase() {
    try {
        await database_1.default.authenticate();
        console.log('Connection to database has been established successfully.');
        await database_1.default.sync({ force: false });
        console.log('Database synchronized successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
initializeDatabase();
