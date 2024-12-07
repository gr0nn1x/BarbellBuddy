"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const liftRoutes_1 = __importDefault(require("./routes/liftRoutes"));
const achievementRoutes_1 = __importDefault(require("./routes/achievementRoutes"));
const friendRoutes_1 = __importDefault(require("./routes/friendRoutes"));
const programRoutes_1 = __importDefault(require("./routes/programRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
const loginRoutes_1 = __importDefault(require("./routes/loginRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const User_1 = require("./models/User");
const Lift_1 = require("./models/Lift");
const Achievement_1 = require("./models/Achievement");
const Friend_1 = require("./models/Friend");
const Group_1 = require("./models/Group");
const Program_1 = require("./models/Program");
const Chat_1 = require("./models/Chat");
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
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
app.use("/api/users", userRoutes_1.default);
app.use("/api/lifts", liftRoutes_1.default);
app.use("/api/achievements", achievementRoutes_1.default);
app.use("/api/friends", friendRoutes_1.default);
app.use("/api/programs", programRoutes_1.default);
app.use("/api/groups", groupRoutes_1.default);
app.use("/api/auth", loginRoutes_1.default);
app.use("/api/chat", chatRoutes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
// Socket.IO middleware for authentication
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error"));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        socket.data.user = decoded;
        next();
    }
    catch (err) {
        next(new Error("Authentication error"));
    }
});
// Socket.IO connection handling
io.on("connection", (socket) => {
    const userId = socket.data.user.id;
    console.log("User connected:", userId);
    // Join a private room for the user
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room: user_${userId}`);
    // Handle private messages
    socket.on("private_message", async (data, callback) => {
        try {
            const { receiverId, message } = data;
            console.log("Attempting to send message:", { senderId: userId, receiverId, message });
            console.log('Attempting to find users with IDs:', { senderId: userId, receiverId });
            // Check if both sender and receiver exist
            const [sender, receiver] = await Promise.all([
                User_1.User.findByPk(userId),
                User_1.User.findByPk(receiverId)
            ]);
            console.log('User lookup results:', {
                senderFound: !!sender,
                receiverFound: !!receiver,
                senderDetails: sender ? { id: sender.id, username: sender.username } : null,
                receiverDetails: receiver ? { id: receiver.id, username: receiver.username } : null
            });
            if (!sender || !receiver) {
                const error = `Sender or receiver not found. Sender ID: ${userId}, Receiver ID: ${receiverId}`;
                console.error(error);
                callback({ success: false, error });
                return;
            }
            // Save message to database
            const chat = await Chat_1.Chat.create({
                senderId: userId,
                receiverId: receiverId,
                message: message,
            });
            console.log("Message saved to database:", chat.toJSON());
            // Emit to sender and receiver
            io.to(`user_${receiverId}`).to(`user_${userId}`).emit("new_message", chat);
            // Confirm message was saved
            callback({ success: true, message: "Message sent and saved successfully" });
        }
        catch (error) {
            console.error("Error sending private message:", error);
            callback({ success: false, error: error.message });
        }
    });
    socket.on("disconnect", () => {
        console.log("User disconnected:", userId);
    });
});
// Start server
const startServer = async () => {
    try {
        await database_1.default.authenticate();
        console.log("Database connection has been established successfully.");
        // Define model associations
        User_1.User.hasMany(Lift_1.Lift);
        Lift_1.Lift.belongsTo(User_1.User);
        User_1.User.hasMany(Achievement_1.Achievement);
        Achievement_1.Achievement.belongsTo(User_1.User);
        User_1.User.hasMany(Friend_1.Friend, { as: "Friends", foreignKey: "userId" });
        Friend_1.Friend.belongsTo(User_1.User, { as: "User", foreignKey: "userId" });
        Friend_1.Friend.belongsTo(User_1.User, { as: "FriendUser", foreignKey: "friendId" });
        User_1.User.hasMany(Program_1.Program);
        Program_1.Program.belongsTo(User_1.User);
        User_1.User.belongsToMany(Group_1.Group, { through: "UserGroups" });
        Group_1.Group.belongsToMany(User_1.User, { through: "UserGroups" });
        User_1.User.hasMany(Chat_1.Chat, { as: "SentChats", foreignKey: "senderId" });
        User_1.User.hasMany(Chat_1.Chat, { as: "ReceivedChats", foreignKey: "receiverId" });
        Chat_1.Chat.belongsTo(User_1.User, { as: "Sender", foreignKey: "senderId" });
        Chat_1.Chat.belongsTo(User_1.User, { as: "Receiver", foreignKey: "receiverId" });
        // Sync models
        await database_1.default.sync({ alter: true });
        console.log("Database synchronized successfully.");
        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Unable to start server:", error);
        process.exit(1);
    }
};
startServer();
