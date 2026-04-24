import express from "express";
import Groq from "groq-sdk";
import pool from "../db/client.js";
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

// GET all journals
router.get("/", auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM journals WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single journal
router.get("/:id", auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM journals WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE journal
router.post("/", auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO journals (user_id, title, content) VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, title, content]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE journal
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const { rows } = await pool.query(
      `UPDATE journals SET title = $1, content = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [title, content, req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE journal
router.delete("/:id", auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `DELETE FROM journals WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ANALYZE mood
router.post("/:id/analyze", auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM journals WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });

    const analysis = await analyzeMood(rows[0].content);
    const { rows: updated } = await pool.query(
      `UPDATE journals SET mood = $1, mood_emoji = $2, mood_summary = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [analysis.mood, analysis.emoji, analysis.summary, req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
