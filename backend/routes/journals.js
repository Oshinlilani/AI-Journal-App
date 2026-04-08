import express from "express";
import Groq from "groq-sdk";
import Journal from "../models/Journal.js";
import auth from "../middleware/auth.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function analyzeMood(content) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a mood analysis assistant. Given a journal entry, respond ONLY with valid JSON, no markdown, no code blocks, no extra text:
{"mood":"<one word mood>","emoji":"<single emoji>","summary":"<1-2 sentence empathetic insight about the writer's emotional state>"}`,
      },
      { role: "user", content },
    ],
    temperature: 0.7,
  });

  const raw = completion.choices[0].message.content.trim();
  return JSON.parse(raw);
}

// GET all journals for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(journals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single journal
router.get("/:id", auth, async (req, res) => {
  try {
    const journal = await Journal.findOne({ _id: req.params.id, user: req.user.id });
    if (!journal) return res.status(404).json({ message: "Not found" });
    res.json(journal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE journal (no analysis)
router.post("/", auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const journal = await Journal.create({ user: req.user.id, title, content });
    res.status(201).json(journal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE journal (no analysis)
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const journal = await Journal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, content },
      { new: true }
    );
    if (!journal) return res.status(404).json({ message: "Not found" });
    res.json(journal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ANALYZE mood for a journal
router.post("/:id/analyze", auth, async (req, res) => {
  try {
    const journal = await Journal.findOne({ _id: req.params.id, user: req.user.id });
    if (!journal) return res.status(404).json({ message: "Not found" });
    const analysis = await analyzeMood(journal.content);
    const updated = await Journal.findByIdAndUpdate(
      journal._id,
      { mood: analysis.mood, moodEmoji: analysis.emoji, moodSummary: analysis.summary },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE journal
router.delete("/:id", auth, async (req, res) => {
  try {
    const journal = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!journal) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
