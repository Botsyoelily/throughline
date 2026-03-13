"use client";

import { useState } from "react";

type ScreenshotUploaderProps = {
  disabled?: boolean;
  onSubmit: (args: { file: File; note: string }) => Promise<void>;
};

export function ScreenshotUploader({
  disabled = false,
  onSubmit
}: ScreenshotUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  async function handleAnalyze() {
    if (!file) {
      setStatus("Choose a screenshot first.");
      return;
    }

    setStatus("Analyzing screenshot...");

    try {
      await onSubmit({ file, note });
      setStatus("Screenshot analyzed.");
      setNote("");
      setFile(null);
    } catch {
      setStatus("Screenshot analysis failed.");
    }
  }

  return (
    <div className="screenshot-panel">
      <label className="upload-dropzone">
        <span>{file ? file.name : "Drop a screenshot here or choose a file"}</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={disabled}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <textarea
        rows={2}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Optional note for extra context."
        disabled={disabled}
      />
      <div className="composer-actions">
        <button
          type="button"
          className="primary-button"
          onClick={handleAnalyze}
          disabled={disabled}
        >
          Analyze screenshot
        </button>
      </div>
      {status ? <p className="muted small">{status}</p> : null}
    </div>
  );
}
