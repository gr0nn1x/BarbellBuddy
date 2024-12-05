"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("./config/database"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const liftRoutes_1 = __importDefault(require("./routes/liftRoutes"));
const achievementRoutes_1 = __importDefault(require("./routes/achievementRoutes"));
const friendRoutes_1 = __importDefault(require("./routes/friendRoutes"));
const programRoutes_1 = __importDefault(require("./routes/programRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
require("./models/User");
require("./models/Lift");
require("./models/Achievement");
require("./models/Friend");
require("./models/Group");
require("./models/Program");
// Load environment variables
dotenv_1.default.config({ path: path_1.default.join(__dirname, "..", ".env") });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Check for JWT_SECRET
if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in the environment variables");
    process.exit(1);
}
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS configuration
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// API Routes
app.use('/api/users', userRoutes_1.default);
app.use('/api/lifts', liftRoutes_1.default);
app.use('/api/achievements', achievementRoutes_1.default);
app.use('/api/friends', friendRoutes_1.default);
app.use('/api/programs', programRoutes_1.default);
app.use('/api/groups', groupRoutes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res
        .status(500)
        .json({ message: "Something went wrong!", error: err.message });
});
// Start server
const startServer = async () => {
    try {
        await database_1.default.authenticate();
        console.log('Database connection has been established successfully.');
        await database_1.default.sync({ force: false });
        console.log("Database synchronized successfully.");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`JWT_SECRET is set: ${!!process.env.JWT_SECRET}`);
        });
    }
    catch (error) {
        console.error("Unable to start server:", error);
        process.exit(1);
    }
};
startServer();
