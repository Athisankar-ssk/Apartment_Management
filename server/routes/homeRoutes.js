import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Home API working" });
});

export default router;
