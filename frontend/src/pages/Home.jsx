function Home({ onUpload, onCamera }) {
  return (
    <main className="home-page">
      <div className="hero card">
        <div className="hero-badge">
          <span className="dot" />
          AI-Powered Detection
        </div>

        <h1>
          Fruit &amp; Veg <span>Analyzer</span>
        </h1>

        <p>
          Upload 1–4 images and get instant freshness scores, shelf-life
          predictions, and nutrition insights powered by AI.
        </p>

        <div className="hero-actions">
          <button className="primary-btn" onClick={onUpload}>
            Upload Images →
          </button>
          <button className="ghost-btn" onClick={onCamera}>
            Use Camera
          </button>
        </div>

        <ul className="hero-features">
          <li>Multi-angle detection</li>
          <li>Shelf life prediction</li>
          <li>Nutrition insights</li>
          <li>Up to 4 images</li>
        </ul>
      </div>
    </main>
  );
}

export default Home;