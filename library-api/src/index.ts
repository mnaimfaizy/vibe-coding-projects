import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import config from "./config/config";
import swaggerSpec from "./config/swagger";
import { connectDatabase } from "./db/database";
import adminRoutes from "./routes/admin";
import authorRoutes from "./routes/authorRoutes";
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import reviewRoutes from "./routes/reviewRoutes";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Connect to database
connectDatabase().catch((err) => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api", reviewRoutes);
app.use("/api/admin", adminRoutes); // Mount admin routes

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Library API is running" });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `Swagger documentation available at http://localhost:${PORT}/api-docs`
  );
});
