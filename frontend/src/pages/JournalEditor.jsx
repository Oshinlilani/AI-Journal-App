import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import MoodBadge from "../components/MoodBadge";

export default function JournalEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", content: "" });
  const [savedId, setSavedId] = useState(id || null);
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/journals/${id}`).then(({ data }) => {
        setForm({ title: data.title, content: data.content });
        if (data.mood) setMood({ mood: data.mood, emoji: data.moodEmoji, summary: data.moodSummary });
      });
    }
  }, [id, isEdit]);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = savedId
        ? await api.put(`/journals/${savedId}`, form)
        : await api.post("/journals", form);
      setSavedId(data._id);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    if (!savedId) return;
    setAnalyzing(true);
    setError("");
    try {
      const { data } = await api.post(`/journals/${savedId}/analyze`);
      setMood({ mood: data.mood, emoji: data.moodEmoji, summary: data.moodSummary });
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="editor-page">
      <h1>{isEdit ? "Edit Entry" : "New Entry"}</h1>
      {error && <div className="alert alert-error">{error}</div>}

      {mood && (
        <div className="editor-mood-result">
          <MoodBadge mood={mood.mood} emoji={mood.emoji} />
          <p className="mood-insight">{mood.summary}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="editor-form">
        <input
          type="text" placeholder="Title" required className="editor-title"
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          placeholder="What's on your mind today?" required rows={14} className="editor-body"
          value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <div className="editor-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/")}>Cancel</button>
          <div className="editor-actions-right">
            {savedId && (
              <button type="button" className="btn btn-analyze" onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? "Analyzing..." : "✨ Analyze Mood"}
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : saved ? "Saved ✓" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
