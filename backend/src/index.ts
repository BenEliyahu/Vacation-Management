import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import userRoutes from "./routes/users";
import vacationRoutes from "./routes/vacations";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

// Security & logging
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);
app.use("/api/users", userRoutes);
app.use("/api/vacations", vacationRoutes);

// 404
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Centralized error handler (must be last)
app.use(errorHandler);

if (require.main === module) {
  AppDataSource.initialize()
    .then(() => {
      console.log("Database connected");
      app.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`)
      );
    })
    .catch((err) => {
      console.error("Database connection failed:", err);
      process.exit(1);
    });
}

export default app;
