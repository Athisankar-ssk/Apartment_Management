import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import { createAdmin } from "./createAdmin.js";


dotenv.config();
connectDB();

createAdmin();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
