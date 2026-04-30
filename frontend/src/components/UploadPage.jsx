const SLOTS = ["Front", "Bottom", "Left", "Right"];

const SLOT_ICONS = {
  Front: "⬆",
  Bottom: "⬇",
  Left: "⬅",
  Right: "➡",
};

function UploadPage({
  slots,
  onFileChange,
  onAnalyze,
  onOpenCamera,
  loading,
  error,
  canAnalyze,
  selectedCount = 0,
}) {
  return (
    <section className="card upload-card">
      {/* Header */}
      <div className="upload-header">
        <div>
          <h2 className="upload-title">Upload Images</h2>
          <p className="upload-subtitle">Add 1–4 angles for the most accurate analysis</p>
        </div>
        <div className="count-pill">
          <span className="count-num">{selectedCount}</span>
          <span className="count-label">/ 4</span>
        </div>
      </div>

      {/* Upload grid */}
      <div className="grid-2">
        {SLOTS.map((slot, idx) => {
          const filled = Boolean(slots[idx]?.preview);
          return (
            <label className={`upload-tile ${filled ? "upload-tile--filled" : ""}`} key={slot}>
              <div className="upload-tile-header">
                <span className="slot-icon">{SLOT_ICONS[slot]}</span>
                <span className="slot-label">{slot} View</span>
                {filled && <span className="slot-check">✓</span>}
              </div>

              <div className="upload-preview">
                {filled ? (
                  <img src={slots[idx].preview} alt={`${slot} preview`} />
                ) : (
                  <div className="upload-empty">
                    <span className="upload-plus">+</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                className="upload-file-input"
                onChange={(e) => onFileChange(idx, e.target.files?.[0] || null)}
              />
            </label>
          );
        })}
      </div>

      {/* Mini preview strip */}
      <div className="preview-strip">
        {slots.map((slot, idx) => (
          <div className={`mini-preview ${slot.preview ? "mini-preview--active" : ""}`} key={SLOTS[idx]}>
            <span className="mini-label">{SLOTS[idx]}</span>
            {slot.preview
              ? <img src={slot.preview} alt={SLOTS[idx]} />
              : <div className="mini-empty">—</div>
            }
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="error-text" role="alert">
          <span className="error-icon">⚠</span>
          {error}
        </div>
      )}

      {/* CTA */}
      <div className="analyze-cta">
        <span className="count-chip">
          <strong>{selectedCount}</strong> image{selectedCount !== 1 ? "s" : ""} selected
        </span>
        <div className="cta-actions">
          <button className="ghost-btn" type="button" onClick={onOpenCamera}>
            Use Camera
          </button>
          <button
            className="primary-btn analyze-btn"
            onClick={onAnalyze}
            disabled={!canAnalyze || loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" /> Analyzing…
              </>
            ) : (
              <>Analyze Now →</>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

export default UploadPage;