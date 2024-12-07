import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database";
import userRoutes from "./routes/userRoutes";
import liftRoutes from "./routes/liftRoutes";
import achievementRoutes from "./routes/achievementRoutes";
import friendRoutes from "./routes/friendRoutes";
import programRoutes from "./routes/programRoutes";
import groupRoutes from "./routes/groupRoutes";
import loginRoutes from "./routes/loginRoutes";
import chatRoutes from "./routes/chatRoutes";
import { User } from "./models/User";
import { Lift } from "./models/Lift";
import { Achievement } from "./models/Achievement";
import { Friend } from "./models/Friend";
import { Group } from "./models/Group";
import { Program } from "./models/Program";
import { Chat } from "./models/Chat";
import { Server } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set in the environment variables");
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/lifts", liftRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api/chat", chatRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

const httpServer = createServer(app);
const io = new Server(httpServer, {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    socket.data.user = decoded;
    next();
  } catch (err) {
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
  socket.on(
    "private_message",
    async (data: { receiverId: string; message: string }, callback) => {
      try {
        const { receiverId, message } = data;
        console.log("Attempting to send message:", { senderId: userId, receiverId, message });

        console.log('Attempting to find users with IDs:', { senderId: userId, receiverId });

        // Check if both sender and receiver exist
        const [sender, receiver] = await Promise.all([
          User.findByPk(userId),
          User.findByPk(receiverId)
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
        const chat = await Chat.create({
          senderId: userId,
          receiverId: receiverId,
          message: message,
        });

        console.log("Message saved to database:", chat.toJSON());

        // Emit to sender and receiver
        io.to(`user_${receiverId}`).to(`user_${userId}`).emit("new_message", chat);

        // Confirm message was saved
        callback({ success: true, message: "Message sent and saved successfully" });
      } catch (error) {
        console.error("Error sending private message:", error);
        callback({ success: false, error: (error as Error).message });
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
  });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    
    // Define model associations
    User.hasMany(Lift);
    Lift.belongsTo(User);

    User.hasMany(Achievement);
    Achievement.belongsTo(User);

    User.hasMany(Friend, { as: "Friends", foreignKey: "userId" });
    Friend.belongsTo(User, { as: "User", foreignKey: "userId" });
    Friend.belongsTo(User, { as: "FriendUser", foreignKey: "friendId" });

    User.hasMany(Program);
    Program.belongsTo(User);

    User.belongsToMany(Group, { through: "UserGroups" });
    Group.belongsToMany(User, { through: "UserGroups" });

    User.hasMany(Chat, { as: "SentChats", foreignKey: "senderId" });
    User.hasMany(Chat, { as: "ReceivedChats", foreignKey: "receiverId" });
    Chat.belongsTo(User, { as: "Sender", foreignKey: "senderId" });
    Chat.belongsTo(User, { as: "Receiver", foreignKey: "receiverId" });

    // Sync models
    await sequelize.sync({ alter: true });

    console.log("Database synchronized successfully.");

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();

