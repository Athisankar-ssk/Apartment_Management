import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import { createAdmin } from "./createAdmin.js";


dotenv.config();

// Connect to database first, then create admin
connectDB().then(() => {
  createAdmin();
}).catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/complaints", complaintRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
