import ImageCard from "./ImageCard";
import ScoreCard from "./ScoreCard";

function ResultPage({ result, onReset }) {
  if (!result) return null;

  return (
    <section className="card result-wrapper">
      {result.type === "single" ? (
        <>
          <ScoreCard finalResult={result.final_result} score={result.final_score} />

          <div className="section-divider">
            <span className="section-divider-label">Multi-Angle Breakdown</span>
          </div>

          <div className="results-grid">
            {result.images.map((item, idx) => (
              <ImageCard key={`${item.label}-${idx}`} result={item} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="result-intro">
            <h3 className="result-intro-title">Analysis Complete</h3>
            <p className="result-intro-sub">
              {result.results?.length} item{result.results?.length !== 1 ? "s" : ""} analyzed
            </p>
          </div>

          <div className="results-grid">
            {result.results.map((item, idx) => (
              <ImageCard key={`${item.label}-${idx}`} result={item} />
            ))}
          </div>
        </>
      )}

      {/* Reset CTA */}
      <div className="result-footer">
        <button className="secondary-btn reset-btn" onClick={onReset}>
          ↩ Analyze New Images
        </button>
      </div>
    </section>
  );
}

export default ResultPage;