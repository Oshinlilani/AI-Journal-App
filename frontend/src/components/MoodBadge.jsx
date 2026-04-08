export default function MoodBadge({ mood, emoji }) {
  if (!mood) return null;
  return (
    <span className="mood-badge">
      {emoji} {mood}
    </span>
  );
}
