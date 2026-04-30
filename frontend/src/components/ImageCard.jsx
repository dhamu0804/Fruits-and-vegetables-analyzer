function statusMeta(status = "") {
  const s = status.toLowerCase();
  if (s.includes("fresh"))   return { cls: "fresh",   icon: "✦", label: "Fresh" };
  if (s.includes("ripe"))    return { cls: "fresh",   icon: "✦", label: "Ripe" };
  if (s.includes("warn") || s.includes("caution")) return { cls: "warning", icon: "◈", label: "Caution" };
  if (s.includes("spoil") || s.includes("bad") || s.includes("rot")) return { cls: "spoiled", icon: "✕", label: "Spoiled" };
  return { cls: "warning", icon: "◈", label: status };
}

function ImageCard({ result }) {
  const meta = statusMeta(result.status);

  return (
    <article className="result-card">
      {/* Title row */}
      <div className="rc-header">
        <h4 className="rc-title">{result.item}</h4>
        <span className={`freshness-badge ${meta.cls}`}>
          {meta.icon} {meta.label}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="rc-confidence">
        <span className="rc-conf-label">Confidence</span>
        <div className="conf-track">
          <div
            className="conf-fill"
            style={{ "--conf": `${result.confidence}%` }}
          />
        </div>
        <span className="rc-conf-val">{result.confidence}%</span>
      </div>

      {/* Info rows */}
      <ul className="rc-info">
        <li>
          <span className="rc-key">🕐 Shelf Life</span>
          <span className="rc-val">{result.shelf_life}</span>
        </li>
        <li>
          <span className="rc-key">🥗 Nutrition</span>
          <span className="rc-val">{result.nutrition}</span>
        </li>
        <li>
          <span className="rc-key">💡 Tip</span>
          <span className="rc-val">{result.health_tip}</span>
        </li>
        <li>
          <span className="rc-key">📦 Storage</span>
          <span className="rc-val">{result.storage_tip}</span>
        </li>
        {result.position && (
          <li>
            <span className="rc-key">📷 View</span>
            <span className="rc-val">{result.position}</span>
          </li>
        )}
        {result.image_name && (
          <li>
            <span className="rc-key">🖼 File</span>
            <span className="rc-val rc-file">{result.image_name}</span>
          </li>
        )}
      </ul>
    </article>
  );
}

export default ImageCard;