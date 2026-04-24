import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import JournalCard from "../components/JournalCard";

export default function Dashboard() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/journals")
      .then(({ data }) => setJournals(data))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id) {
    setJournals((prev) => prev.filter((j) => j._id !== id));
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Journal</h1>
        <button className="btn btn-primary" onClick={() => navigate("/journal/new")}>
          + New Entry
        </button>
      </div>

      {loading && <p className="loading-text">Loading your entries...</p>}

      {!loading && journals.length === 0 && (
        <div className="empty-state">
          <p>No entries yet. Start writing your first journal entry.</p>
          <button className="btn btn-primary" onClick={() => navigate("/journal/new")}>
            Write something
          </button>
        </div>
      )}

      <div className="journal-grid">
        {journals.map((j) => (
          <JournalCard key={j._id} journal={j} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
