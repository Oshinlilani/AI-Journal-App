import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MoodBadge from "./MoodBadge";
import api from "../api/axios";

export default function JournalCard({ journal, onDelete, onUpdate }) {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [cardData, setCardData] = useState(journal);

  const date = new Date(cardData.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  async function handleDelete(e) {
    e.stopPropagation();
    if (!confirm("Delete this entry?")) return;
    await api.delete(`/journals/${cardData._id}`);
    onDelete(cardData._id);
  }

  async function handleAnalyze(e) {
    e.stopPropagation();
    setAnalyzing(true);
    try {
      const { data } = await api.post(`/journals/${cardData._id}/analyze`);
      setCardData(data);
      if (onUpdate) onUpdate(data);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="journal-card" onClick={() => navigate(`/journal/${cardData._id}`)}>
      <div className="card-header">
        <h3>{cardData.title}</h3>
        <MoodBadge mood={cardData.mood} emoji={cardData.moodEmoji} />
      </div>
      <p className="card-preview">{cardData.content.slice(0, 120)}...</p>
      {cardData.moodSummary && (
        <p className="card-insight">💡 {cardData.moodSummary}</p>
      )}
      <div className="card-footer">
        <span className="card-date">{date}</span>
        <div className="card-actions">
          <button
            className="btn btn-sm btn-analyze-sm"
            onClick={handleAnalyze}
            disabled={analyzing}
            title="Analyze mood"
          >
            {analyzing ? "..." : "✨ Analyze"}
          </button>
          <button
            className="btn btn-sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/journal/${cardData._id}/edit`); }}
          >
            Edit
          </button>
          <button className="btn btn-sm btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}
