import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { urlencoded } from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import timesheetRoutes from "./routes/timesheet.routes.js";
import userRoutes from "./routes/user.routes.js";
import workRoutes from "./routes/work.routes.js";
import logger from "./utils/logger.js";

const app = express();
dotenv.config();
const env = process.env.NODE_ENV || "development";
const port = process.env.PORT || 3000;
// Initialize Database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established");

    if (env === "development") {
      await sequelize.sync({ alter: false, force: false });
      logger.info("Database synced");
    }
  } catch (error) {
    logger.error("Database connection failed:", error);
    throw error;
  }
}

// Initialize Middlewares
function initializeMiddlewares() {
  const allowedOrigins = [
    "http://localhost:3001",
    "http://localhost:3000",
    "https://thecaresnow.com",
    "https://admin.thecaresnow.com",
    "*"
  ];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    })
  );
  app.use(helmet());
  app.use(cookieParser());
  app.use(express.json({ limit: "20mb" }));
  app.use(urlencoded({ extended: true }));

  if (env !== "test") {
    app.use(
      morgan("combined", {
        stream: { write: (message) => logger.info(message.trim()) },
      })
    );
  }
}

function initializeRoutes() {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/works", workRoutes);
  app.use("/api/timesheet", timesheetRoutes);
  app.use("/api/employee", employeeRoutes);

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
}

// Initialize Swagger
function initializeSwagger() {
  if (env === "development") {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
}

// Initialize Error Handling
function initializeErrorHandling() {
  app.use((err, req, res, next) => {
    logger.error(err.stack);
    const status = Number.isInteger(err.status) ? err.status : 400;
    const message = err.message || "Internal server error";
    res.status(status).json({
      status,
      message,
      data: null,
    });
  });
}
// Start the application
async function start() {
  try {
    await initializeDatabase();
    initializeMiddlewares();
    initializeRoutes();
    initializeSwagger();
    initializeErrorHandling();
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    app.use("/public", express.static(path.join(__dirname, "public")));
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));
    app.use(express.static(path.join(__dirname, "public")));
    app.use(express.static(path.join(__dirname, "uploads")));
    app.listen(port, () => {
      logger.info(`Server running on port ${port} in ${env} mode`);
      logger.info(
        `API documentation available at http://localhost:${port}/api-docs`
      );
      //mysql
      logger.info(
        `Database connected at ${process.env.DB_HOST}:${process.env.DB_PORT}`
      );
    });
  } catch (error) {
    logger.error("Application failed to start:", error);
    process.exit(1);
  }
}

start();
