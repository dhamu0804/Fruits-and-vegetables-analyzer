import { useState } from "react";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";

function App() {
  const [screen, setScreen] = useState("home");
  const [analyzeMode, setAnalyzeMode] = useState("upload");

  return (
    <div className="app-shell">
      {screen === "home" ? (
        <Home
          onUpload={() => {
            setAnalyzeMode("upload");
            setScreen("analyze");
          }}
          onCamera={() => {
            setAnalyzeMode("camera");
            setScreen("analyze");
          }}
        />
      ) : (
        <Analyze
          initialMode={analyzeMode}
          onBackHome={() => setScreen("home")}
        />
      )}
    </div>
  );
}

export default App;
