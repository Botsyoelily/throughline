"use client";

import { useEffect, useState } from "react";

import { GeneratingIndicator } from "@/components/brand/generating-indicator";
import { ScreenshotUploader } from "@/components/chat/screenshot-uploader";
import { VoiceRecorder } from "@/components/chat/voice-recorder";
import { VerdictCard } from "@/components/verdict/verdict-card";
import type {
  AnalysisResponse,
  InputMode,
  StoredAnalysisClient,
  VerdictAction
} from "@/lib/types";

type Message =
  | { id: string; role: "user"; content: string; source: InputMode }
  | {
      id: string;
      role: "assistant";
      analysis: AnalysisResponse;
      analysisId?: string;
      verdictAction?: VerdictAction;
    };

const modeDescriptions: Record<InputMode, string> = {
  text: "Paste a privacy prompt, consent request, or policy excerpt.",
  screenshot:
    "Upload a screenshot. Throughline will use browser-side text extraction when available, with your note as a fallback.",
  voice:
    "Record a voice description of the prompt. Your browser transcript is sent through the same secure analysis flow."
};

export function ChatClient() {
  const [activeMode, setActiveMode] = useState<InputMode>("text");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<StoredAnalysisClient[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const response = await fetch("/api/analyses");

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { analyses: StoredAnalysisClient[] };
      setHistory(data.analyses);
    } catch {
      // Keep the interface usable even if history cannot be loaded.
    }
  }

  function appendAnalysisMessages(
    userContent: string,
    source: InputMode,
    analysis: AnalysisResponse & { id?: string },
    verdictAction?: VerdictAction
  ) {
    const timestamp = Date.now();

    setMessages((current) => [
      ...current,
      {
        id: `${timestamp}-user`,
        role: "user",
        content: userContent,
        source
      },
      {
        id: `${timestamp}-assistant`,
        role: "assistant",
        analysis,
        analysisId: analysis.id,
        verdictAction
      }
    ]);
  }

  async function submitPrompt() {
    const trimmed = prompt.trim();

    if (trimmed.length < 10) {
      setError("Enter a longer privacy request so Throughline can analyze it.");
      return;
    }

    setError("");
    setIsGenerating(true);
    setPrompt("");

    try {
      const response = await fetch("/api/analyze/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: trimmed })
      });

      const data = (await response.json()) as AnalysisResponse & { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Analysis failed.");
        return;
      }

      appendAnalysisMessages(trimmed, "text", data);
      await loadHistory();
    } catch {
      setError("Unable to reach the analysis service.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function submitVoiceTranscript(transcript: string) {
    setError("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/analyze/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: transcript })
      });
      const data = (await response.json()) as AnalysisResponse & { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Voice analysis failed.");
        return;
      }

      appendAnalysisMessages(transcript, "voice", data);
      await loadHistory();
      setActiveMode("text");
    } catch {
      setError("Unable to reach the voice analysis service.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function submitScreenshotAnalysis({
    file,
    extractedText,
    note
  }: {
    file: File;
    extractedText: string;
    note: string;
  }) {
    setError("");
    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("extractedText", extractedText);
      formData.set("note", note);

      const response = await fetch("/api/analyze/image", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as AnalysisResponse & { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Screenshot analysis failed.");
        return;
      }

      appendAnalysisMessages(extractedText || note || file.name, "screenshot", data);
      await loadHistory();
      setActiveMode("text");
    } catch {
      setError("Unable to reach the screenshot analysis service.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function submitVerdictAction(analysisId: string, action: VerdictAction) {
    try {
      const response = await fetch("/api/verdict-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ analysisId, action })
      });

      if (!response.ok) {
        setError("Unable to save your verdict choice.");
        return;
      }

      setMessages((current) =>
        current.map((message) =>
          message.role === "assistant" && message.analysisId === analysisId
            ? { ...message, verdictAction: action }
            : message
        )
      );
      await loadHistory();
    } catch {
      setError("Unable to save your verdict choice.");
    }
  }

  function resetConversation() {
    setMessages([]);
    setPrompt("");
    setError("");
    setIsGenerating(false);
  }

  return (
    <main className="chat-shell">
      <aside className="glass-panel sidebar">
        <div>
          <p className="eyebrow">Recent analyses</p>
          <ul className="history-list">
            {history.slice(0, 5).map((item) => (
              <li key={item.id}>
                <span className="history-source">{item.source}</span>
                {item.prompt}
              </li>
            ))}
          </ul>
        </div>
        <div className="projection-score">
          <p className="eyebrow">Projection score</p>
          <strong>3.69 baseline</strong>
          <p className="muted">
            Track whether Throughline improves consequence awareness.
          </p>
        </div>
      </aside>

      <section className="workspace">
        <header className="workspace-header glass-panel">
          <div>
            <p className="eyebrow">Active analysis</p>
            <h1>Understand what happens after you click</h1>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={resetConversation}
          >
            New analysis
          </button>
        </header>

        <section className="message-list">
          {messages.length === 0 ? (
            <article className="glass-panel analysis-card empty-state">
              <p className="eyebrow">Start here</p>
              <h2>
                Submit text, a screenshot, or a voice description and Throughline
                will project the likely privacy consequences.
              </h2>
              <p className="muted">
                Text, screenshot, and voice analysis are now connected to the
                same secure session-scoped backend flow.
              </p>
            </article>
          ) : null}

          {messages.map((message) =>
            message.role === "user" ? (
              <article key={message.id} className="message user-message">
                <p>{message.content}</p>
              </article>
            ) : (
              <article key={message.id} className="message assistant-message">
                <VerdictCard
                  analysis={message.analysis}
                  selectedAction={message.verdictAction}
                  onAction={
                    message.analysisId
                      ? (action) => submitVerdictAction(message.analysisId!, action)
                      : undefined
                  }
                />
                <div className="glass-panel analysis-card">
                  <p className="assistant-summary">{message.analysis.summary}</p>
                  <div className="impact-grid">
                    <div>
                      <h3>Immediate</h3>
                      <p>{message.analysis.impacts.immediate}</p>
                    </div>
                    <div>
                      <h3>Short-term</h3>
                      <p>{message.analysis.impacts.shortTerm}</p>
                    </div>
                    <div>
                      <h3>Long-term</h3>
                      <p>{message.analysis.impacts.longTerm}</p>
                    </div>
                  </div>
                  <div className="follow-up-row">
                    {message.analysis.userOptions.map((option) => (
                      <button
                        key={option.id}
                        className="secondary-button"
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            )
          )}

          {isGenerating ? <GeneratingIndicator /> : null}
        </section>

        <section className="glass-panel input-tabs">
          <div className="pill-row" role="tablist" aria-label="Input modes">
            {(["text", "screenshot", "voice"] as InputMode[]).map((mode) => (
              <button
                key={mode}
                className={mode === activeMode ? "pill active" : "pill"}
                type="button"
                role="tab"
                aria-selected={mode === activeMode}
                onClick={() => setActiveMode(mode)}
              >
                {mode[0].toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <p className="muted">{modeDescriptions[activeMode]}</p>

          {activeMode === "text" ? (
            <div className="composer">
              <textarea
                placeholder="What is this app asking for, and should I accept it?"
                rows={4}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
              <div className="composer-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setPrompt(
                      "This app wants my location all the time so it can personalize nearby offers and share analytics with partners."
                    )
                  }
                >
                  Try sample prompt
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={submitPrompt}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Analyzing..." : "Analyze request"}
                </button>
              </div>
            </div>
          ) : null}

          {activeMode === "screenshot" ? (
            <ScreenshotUploader
              disabled={isGenerating}
              onSubmit={submitScreenshotAnalysis}
            />
          ) : null}

          {activeMode === "voice" ? (
            <VoiceRecorder
              disabled={isGenerating}
              onSubmit={submitVoiceTranscript}
            />
          ) : null}

          {error ? (
            <p className="error-text" role="alert">
              {error}
            </p>
          ) : null}
        </section>
      </section>
    </main>
  );
}
