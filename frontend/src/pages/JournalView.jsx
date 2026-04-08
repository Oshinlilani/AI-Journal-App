import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import MoodBadge from "../components/MoodBadge";

export default function JournalView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);

  useEffect(() => {
    api.get(`/journals/${id}`).then(({ data }) => setJournal(data));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this entry?")) return;
    await api.delete(`/journals/${id}`);
    navigate("/");
  }

  if (!journal) return <p className="loading-text">Loading...</p>;

  const date = new Date(journal.createdAt).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="journal-view">
      <div className="view-header">
        <button className="btn btn-ghost" onClick={() => navigate("/")}>← Back</button>
        <div className="view-actions">
          <button className="btn btn-ghost" onClick={() => navigate(`/journal/${id}/edit`)}>Edit</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
      <p className="view-date">{date}</p>
      <div className="view-title-row">
        <h1>{journal.title}</h1>
        <MoodBadge mood={journal.mood} emoji={journal.moodEmoji} />
      </div>
      {journal.moodSummary && (
        <div className="view-insight">💡 {journal.moodSummary}</div>
      )}
      <div className="view-content">{journal.content}</div>
    </div>
  );
}
