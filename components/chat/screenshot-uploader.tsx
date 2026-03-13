"use client";

import { useId, useState } from "react";

type ScreenshotUploaderProps = {
  disabled?: boolean;
  onSubmit: (args: { file: File; extractedText: string; note: string }) => Promise<void>;
};

declare global {
  interface Window {
    TextDetector?: new () => {
      detect(input: ImageBitmapSource): Promise<Array<{ rawValue: string }>>;
    };
  }
}

async function extractTextFromImage(file: File) {
  if (typeof window === "undefined" || !window.TextDetector) {
    return "";
  }

  const bitmap = await createImageBitmap(file);
  const detector = new window.TextDetector();
  const blocks = await detector.detect(bitmap);

  return blocks.map((block) => block.rawValue).join(" ").trim();
}

export function ScreenshotUploader({
  disabled = false,
  onSubmit
}: ScreenshotUploaderProps) {
  const noteId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  async function handleAnalyze() {
    if (!file) {
      setStatus("Choose a screenshot first.");
      return;
    }

    setStatus("Extracting text from screenshot...");

    try {
      const extractedText = await extractTextFromImage(file);
      await onSubmit({ file, extractedText, note });
      setStatus(
        extractedText
          ? "Screenshot analyzed."
          : "Screenshot sent with your note because browser text extraction was unavailable."
      );
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
      <label className="field" htmlFor={noteId}>
        <span>Optional note</span>
        <textarea
          id={noteId}
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="If extraction is unavailable, briefly describe the request shown in the screenshot."
          disabled={disabled}
        />
      </label>
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

