import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String, default: null },       // e.g. "Happy", "Anxious"
  moodEmoji: { type: String, default: null },  // e.g. "😊"
  moodSummary: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("Journal", journalSchema);
