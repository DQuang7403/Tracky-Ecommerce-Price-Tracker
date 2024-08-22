import dotenv from "dotenv";
import express from "express";
import userRoutes from "./routes/users.js";
import productRoutes from "./routes/product.js";
import { logger } from "./middleware/logEvents.js";
import authRoutes from "./routes/auth.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initRedis, setRedisItem } from "./feature/redis.js";
import cron from "node-cron";
import mongoose from "mongoose";
import { connectDB } from "./config/mongodb.js";
import { initializeCronJobs } from "./feature/cronJob.js";
import { scrapeSaleProducts } from "./scraper/winmart.js";
import { corsOptions } from "./config/corsOptions.js";
import { errorHandler } from "./middleware/errorHandler.js";
const app = express();
dotenv.config();

connectDB();
//middleware
app.use(logger);
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Tracky API" });
});

app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/auth", authRoutes);

app.use(errorHandler);

initializeCronJobs()
  .then(() => {
    console.log("Cron jobs initialized");
  })
  .catch((error) => {
    console.log("Error initializing cron jobs:", error);
  });

cron.schedule("0 0 * * *", async () => {
  let products = await scrapeSaleProducts();
  await setRedisItem("SALE_PRODUCTS", products);
  console.log("Updated sale products");
});

const PORT = process.env.PORT || 5000;

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    initRedis();
    console.log(`Server listened on port ${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});
