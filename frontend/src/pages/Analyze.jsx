import { useEffect, useMemo, useRef, useState } from "react";
import ResultPage from "../components/ResultPage";
import UploadPage from "../components/UploadPage";
import { analyzeImages } from "../services/api";

const initialSlots = [
  { file: null, preview: "" },
  { file: null, preview: "" },
  { file: null, preview: "" },
  { file: null, preview: "" },
];
const CAPTURE_ORDER = ["Front", "Bottom", "Left", "Right"];

function Analyze({ onBackHome, initialMode = "upload" }) {
  const [slots, setSlots] = useState(initialSlots);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(initialMode === "camera");
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [captureIndex, setCaptureIndex] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const selectedFiles = useMemo(
    () => slots.map((x) => x.file).filter(Boolean),
    [slots]
  );

  const stopCamera = () => {
    setCameraReady(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const attachStreamToVideo = async (stream) => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;

    await new Promise((resolve) => {
      if (video.readyState >= 1) {
        resolve();
        return;
      }

      const onLoadedMeta = () => {
        video.removeEventListener("loadedmetadata", onLoadedMeta);
        resolve();
      };

      video.addEventListener("loadedmetadata", onLoadedMeta);
    });

    await video.play();
    setCameraReady(true);
  };

  const startCamera = async (index = 0) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not supported in this browser.");
      return;
    }

    try {
      stopCamera();

      // Try environment camera first, then fallback to any available camera.
      const constraintsList = [
        {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        },
        { video: true, audio: false },
      ];

      let stream = null;
      let lastError = null;

      for (const constraints of constraintsList) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!stream) {
        throw lastError || new Error("No camera stream available.");
      }

      streamRef.current = stream;
      setCaptureIndex(index);
      setCameraOpen(true);
      setCameraError("");

      requestAnimationFrame(() => {
        attachStreamToVideo(stream).catch(() => {
          setCameraError("Could not start live preview. Try closing and reopening camera.");
          setCameraReady(false);
        });
      });
    } catch (err) {
      setCameraError(
        err?.message ||
          "Unable to open camera. Please allow camera permission and retry."
      );
      setCameraOpen(false);
    }
  };

  useEffect(() => {
    if (initialMode === "camera") {
      startCamera(0);
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cameraOpen && streamRef.current && videoRef.current) {
      attachStreamToVideo(streamRef.current).catch(() => {
        setCameraError("Tap the video area once if autoplay is blocked.");
        setCameraReady(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOpen]);

  const setSlotFile = (index, file) => {
    setError("");
    setResult(null);

    setSlots((prev) => {
      const copy = [...prev];

      if (copy[index].preview) {
        URL.revokeObjectURL(copy[index].preview);
      }

      copy[index] = {
        file,
        preview: file ? URL.createObjectURL(file) : "",
      };

      return copy;
    });
  };

  const onAnalyze = async () => {
    if (selectedFiles.length < 1) {
      setError("Please upload at least one image.");
      return;
    }

    if (selectedFiles.length > 4) {
      setError("You can upload a maximum of 4 images.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await analyzeImages(selectedFiles);
      setResult(response);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to analyze images.");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    slots.forEach((slot) => {
      if (slot.preview) URL.revokeObjectURL(slot.preview);
    });
    setSlots(initialSlots);
    setResult(null);
    setError("");
    setCameraError("");
    setCaptureIndex(0);
    stopCamera();
    setCameraOpen(false);
  };

  const openCameraFromUpload = () => {
    const firstEmptyIndex = slots.findIndex((slot) => !slot.file);
    const nextIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    startCamera(nextIndex);
  };

  const captureCurrentView = () => {
    if (!videoRef.current || !cameraReady) {
      setCameraError("Camera is still starting. Please wait a moment.");
      return;
    }

    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    if (!video.videoWidth || !video.videoHeight) {
      setCameraError("Live preview not ready yet. Please try again in a second.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Failed to capture frame from camera.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    const currentIndex = captureIndex;
    const slotName = CAPTURE_ORDER[currentIndex] || "view";

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Captured image is empty. Please try again.");
          return;
        }

        const file = new File(
          [blob],
          `camera-${slotName.toLowerCase()}-${Date.now()}.jpg`,
          { type: "image/jpeg" }
        );

        setSlotFile(currentIndex, file);

        if (currentIndex >= CAPTURE_ORDER.length - 1) {
          stopCamera();
          setCameraOpen(false);
        } else {
          setCaptureIndex(currentIndex + 1);
        }
      },
      "image/jpeg",
      0.95
    );
  };

  const closeCameraPanel = () => {
    stopCamera();
    setCameraOpen(false);
  };

  return (
    <main className="analyze-page">
      {/* ── Top Nav ── */}
      <header className="top-nav card">
        <button className="ghost-btn" onClick={onBackHome}>
          ← Back
        </button>
        <h2>Upload · Analyze · Decide</h2>
      </header>

      {/* ── Loading overlay ── */}
      {loading && (
        <section className="card loading-card">
          <div className="loading-orbs">
            <span className="orb" />
            <span className="orb" />
            <span className="orb" />
          </div>
          <h3>Analyzing your images…</h3>
          <p>Processing freshness, quality, and nutrition data.</p>
          <div className="progress-track">
            <span className="progress-fill" />
          </div>
        </section>
      )}

      {cameraOpen && !result && (
        <section className="card camera-card">
          <div className="camera-head">
            <div>
              <h3>Live Camera Capture</h3>
              <p>
                Capture <strong>{CAPTURE_ORDER[captureIndex]}</strong> view
                ({captureIndex + 1}/4)
              </p>
            </div>
            <button className="ghost-btn" onClick={closeCameraPanel}>
              Close Camera
            </button>
          </div>

          <div className="camera-feed-wrap">
            <video ref={videoRef} className="camera-feed" autoPlay muted playsInline />
          </div>

          {cameraError && <p className="error-text">{cameraError}</p>}

          <div className="camera-actions">
            <button className="secondary-btn" onClick={captureCurrentView} disabled={!cameraReady}>
              {cameraReady
                ? `Capture ${CAPTURE_ORDER[captureIndex]}`
                : "Starting Camera..."}
            </button>
          </div>
        </section>
      )}

      {/* ── Upload or Result ── */}
      {!result ? (
        <UploadPage
          slots={slots}
          onFileChange={setSlotFile}
          onAnalyze={onAnalyze}
          onOpenCamera={openCameraFromUpload}
          loading={loading}
          error={error}
          canAnalyze={selectedFiles.length >= 1}
          selectedCount={selectedFiles.length}
        />
      ) : (
        <ResultPage result={result} onReset={resetFlow} />
      )}
    </main>
  );
}

export default Analyze;