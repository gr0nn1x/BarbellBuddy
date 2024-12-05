import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import sequelize from "./config/database";
import userRoutes from "./routes/userRoutes";
import liftRoutes from "./routes/liftRoutes";
import achievementRoutes from "./routes/achievementRoutes";
import friendRoutes from "./routes/friendRoutes";
import programRoutes from './routes/programRoutes';
import groupRoutes from './routes/groupRoutes';
import './models/User';
import './models/Lift';
import './models/Achievement';
import './models/Friend';
import './models/Group';
import './models/Program';

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Check for JWT_SECRET
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
app.use('/api/users', userRoutes);
app.use('/api/lifts', liftRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/groups', groupRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: err.message });
  }
);

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync({ force: false });
    console.log("Database synchronized successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`JWT_SECRET is set: ${!!process.env.JWT_SECRET}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();

