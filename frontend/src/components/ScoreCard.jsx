function statusMeta(status = "") {
  const s = String(status).toLowerCase();
  if (s.includes("fresh")) return { cls: "fresh", icon: "✦", label: "Fresh" };
  if (s.includes("ripe")) return { cls: "fresh", icon: "✦", label: "Ripe" };
  if (s.includes("warn") || s.includes("caution")) {
    return { cls: "warning", icon: "◈", label: "Caution" };
  }
  if (s.includes("spoil") || s.includes("bad") || s.includes("rot")) {
    return { cls: "spoiled", icon: "✕", label: "Spoiled" };
  }
  return { cls: "warning", icon: "◈", label: status || "Unknown" };
}

function ScoreCard({ finalResult, score }) {
  if (!finalResult) return null;

  const meta = statusMeta(finalResult.status);
  const confidence = Number(finalResult.confidence || 0).toFixed(2);
  const avgScore = Number(score || 0).toFixed(2);

  return (
    <section className="card final-card">
      <div className="final-header">
        <div>
          <p className="final-kicker">Overall Analysis</p>
          <h3 className="final-title">Final Result</h3>
        </div>
        <span className={`freshness-badge ${meta.cls}`}>
          {meta.icon} {meta.label}
        </span>
      </div>

      <div className="final-metrics">
        <article className="metric-chip">
          <span className="metric-label">Item</span>
          <strong className="metric-value">{finalResult.item}</strong>
        </article>
        <article className="metric-chip">
          <span className="metric-label">Confidence</span>
          <strong className="metric-value">{confidence}%</strong>
        </article>
        <article className="metric-chip">
          <span className="metric-label">Final Score</span>
          <strong className="metric-value">{avgScore}%</strong>
        </article>
      </div>

      <div className="final-details">
        <div className="detail-row">
          <span className="detail-key">Label</span>
          <strong className="detail-value">{finalResult.label}</strong>
        </div>
        <div className="detail-row">
          <span className="detail-key">Shelf Life</span>
          <strong className="detail-value">{finalResult.shelf_life}</strong>
        </div>
        <div className="detail-row">
          <span className="detail-key">Storage</span>
          <strong className="detail-value">{finalResult.storage_tip}</strong>
        </div>
        <div className="detail-row">
          <span className="detail-key">Nutrition</span>
          <strong className="detail-value">{finalResult.nutrition}</strong>
        </div>
        <div className="detail-row detail-row--full">
          <span className="detail-key">Health Tip</span>
          <strong className="detail-value">{finalResult.health_tip}</strong>
        </div>
      </div>
    </section>
  );
}

export default ScoreCard;