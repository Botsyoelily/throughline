"use client";

import { useEffect, useRef, useState } from "react";

type VoiceRecorderProps = {
  disabled?: boolean;
  onSubmit: (transcript: string) => Promise<void>;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function VoiceRecorder({ disabled = false, onSubmit }: VoiceRecorderProps) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Voice transcription uses your browser speech engine.");

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition ?? window.webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .flatMap((result) => Array.from(result))
        .map((item) => item.transcript)
        .join(" ")
        .trim();

      setTranscript(text);
    };
    recognition.onerror = () => {
      setStatus("Voice transcription failed. Try again or paste the request as text.");
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    setIsSupported(true);
  }, []);

  async function submitTranscript() {
    if (transcript.trim().length < 10) {
      setStatus("Record a longer transcript so Throughline can analyze it.");
      return;
    }

    setStatus("Submitting transcript...");
    await onSubmit(transcript);
    setStatus("Transcript analyzed.");
    setTranscript("");
  }

  function toggleRecording() {
    if (!recognitionRef.current || disabled) {
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setStatus("Recording stopped.");
      setIsRecording(false);
      return;
    }

    setTranscript("");
    setStatus("Listening...");
    recognitionRef.current.start();
    setIsRecording(true);
  }

  if (!isSupported) {
    return (
      <div className="voice-panel">
        <p className="muted">
          Browser voice recognition is not available here. Use text input or add
          a transcription provider next.
        </p>
      </div>
    );
  }

  return (
    <div className="voice-panel">
      <div className="wave-row" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <button
        type="button"
        className="primary-button"
        onClick={toggleRecording}
        disabled={disabled}
      >
        {isRecording ? "Stop recording" : "Start recording"}
      </button>
      <textarea
        rows={3}
        value={transcript}
        onChange={(event) => setTranscript(event.target.value)}
        placeholder="Transcript will appear here."
        disabled={disabled}
      />
      <button
        type="button"
        className="secondary-button"
        onClick={submitTranscript}
        disabled={disabled}
      >
        Analyze transcript
      </button>
      <p className="muted small">{status}</p>
    </div>
  );
}
