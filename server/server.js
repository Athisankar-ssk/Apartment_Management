import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import playgroundRoutes from "./routes/playgroundRoutes.js";
import partyHallRoutes from "./routes/partyHallRoutes.js";
import swimmingPoolRoutes from "./routes/swimmingPoolRoutes.js";
import meetingHallRoutes from "./routes/meetingHallRoutes.js";
import { createAdmin } from "./createAdmin.js";


dotenv.config();


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
app.use("/api/playground", playgroundRoutes);
app.use("/api/partyhall", partyHallRoutes);
app.use("/api/swimming-pool", swimmingPoolRoutes);
app.use("/api/meeting-hall", meetingHallRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
