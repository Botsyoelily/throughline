"use client";

import { useEffect, useRef, useState } from "react";

import { GeneratingIndicator } from "@/components/brand/generating-indicator";
import { ScreenshotUploader } from "@/components/chat/screenshot-uploader";
import { VoiceRecorder } from "@/components/chat/voice-recorder";
import { ThroughlineLogo } from "@/components/brand/throughline-logo";
import { VerdictCard } from "@/components/verdict/verdict-card";
import { ExpandableText } from "@/components/ui/expandable-text";
import type {
  AnalysisResponse,
  InputMode,
  VerdictAction
} from "@/lib/types";

type Message =
  | { id: string; role: "user"; content: string; source: InputMode }
  | {
      id: string;
      role: "assistant";
      analysis: AnalysisResponse;
      verdictAction?: VerdictAction;
    }
  | {
      id: string;
      role: "assistant_note";
      title: string;
      content: string;
    };

const modeDescriptions: Record<InputMode, string> = {
  text: "Paste a privacy prompt, consent request, or policy excerpt.",
  screenshot:
    "Upload a screenshot. Throughline will use browser-side text extraction when available, with your note as a fallback.",
  voice:
    "Record a voice description of the prompt. Your browser transcript is sent through the same secure analysis flow."
};

const tierMeta = [
  {
    key: "immediate" as const,
    className: "perception",
    badge: "Level 1",
    label: "Perception",
    phase: "What is visible now?"
  },
  {
    key: "shortTerm" as const,
    className: "comprehension",
    badge: "Level 2",
    label: "Comprehension",
    phase: "What does it mean in context?"
  },
  {
    key: "longTerm" as const,
    className: "projection",
    badge: "Level 3",
    label: "Projection",
    phase: "Where does this lead over time?"
  }
];

export function ChatClient() {
  const [activeMode, setActiveMode] = useState<InputMode>("text");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [orbitalPulse, setOrbitalPulse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isGenerating]);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];

    if (!latestMessage || latestMessage.role !== "assistant") {
      return;
    }

    setOrbitalPulse(true);
    const timeout = window.setTimeout(() => setOrbitalPulse(false), 1800);

    return () => window.clearTimeout(timeout);
  }, [messages]);

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
        verdictAction
      }
    ]);
  }

  function appendAssistantNote(title: string, content: string) {
    const timestamp = Date.now();

    setMessages((current) => [
      ...current,
      {
        id: `${timestamp}-assistant-note`,
        role: "assistant_note",
        title,
        content
      }
    ]);
  }

  function getOriginalPrompt(messagesList: Message[], index: number, fallback: string) {
    const previous = messagesList[index - 1];

    if (previous && previous.role === "user") {
      return previous.content;
    }

    return fallback;
  }

  async function submitFollowUp(
    optionId: "dig_deeper" | "my_rights",
    originalPrompt: string,
    analysis: AnalysisResponse
  ) {
    setError("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/analyze/follow-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          optionId,
          originalPrompt,
          summary: analysis.summary,
          rationale: analysis.rationale,
          recommendation: analysis.recommendation
        })
      });

      const data = (await response.json()) as {
        content?: string;
        title?: string;
        error?: string;
      };

      if (!response.ok || !data.content || !data.title) {
        setError(data.error ?? "Follow-up analysis failed.");
        return;
      }

      appendAssistantNote(data.title, data.content);
    } catch {
      setError("Unable to reach the follow-up analysis service.");
    } finally {
      setIsGenerating(false);
    }
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
      setActiveMode("text");
    } catch {
      setError("Unable to reach the voice analysis service.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function submitScreenshotAnalysis({
    file,
    note
  }: {
    file: File;
    note: string;
  }) {
    setError("");
    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.set("file", file);
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

      appendAnalysisMessages(note || file.name, "screenshot", data);
      setActiveMode("text");
    } catch {
      setError("Unable to reach the screenshot analysis service.");
    } finally {
      setIsGenerating(false);
    }
  }

  function resetConversation() {
    setMessages([]);
    setPrompt("");
    setError("");
    setIsGenerating(false);
    setActiveMode("text");
  }

  function handleUserOption(
    optionId: "dig_deeper" | "my_rights" | "analyze_another",
    originalPrompt: string,
    analysis: AnalysisResponse
  ) {
    if (optionId === "analyze_another") {
      resetConversation();
      return;
    }

    void submitFollowUp(optionId, originalPrompt, analysis);
  }

  return (
    <main className="chat-body">
      <div
        className={orbitalPulse ? "orbital-field orbital-field-pulse" : "orbital-field"}
        aria-hidden="true"
      >
        <svg className="orbital-svg" viewBox="0 0 520 720" fill="none">
          <g className="orbital-float">
            <ellipse
              className="orbital-ring orbital-ring-a"
              cx="290"
              cy="310"
              rx="170"
              ry="206"
            />
            <ellipse
              className="orbital-ring orbital-ring-b"
              cx="290"
              cy="310"
              rx="120"
              ry="152"
            />
            <path
              className="orbital-thread-path"
              d="M108 242C164 206 221 196 279 220C352 249 392 316 422 408"
            />
            <path
              className="orbital-thread-path orbital-thread-soft"
              d="M168 468C225 503 303 513 370 474C410 450 433 412 445 358"
            />
          </g>
          <g className="orbital-rotate orbital-rotate-slow">
            <circle className="orbital-node orbital-node-core" cx="290" cy="158" r="11" />
            <circle className="orbital-node orbital-node-muted" cx="437" cy="304" r="8" />
            <circle className="orbital-node orbital-node-deep" cx="320" cy="506" r="9" />
          </g>
          <g className="orbital-rotate orbital-rotate-reverse">
            <circle className="orbital-node orbital-node-muted" cx="138" cy="305" r="7" />
            <circle className="orbital-node orbital-node-core" cx="246" cy="456" r="10" />
            <circle className="orbital-node orbital-node-deep" cx="350" cy="220" r="6" />
          </g>
          <g className="orbital-echo">
            <path className="orbital-accent" d="M228 141L249 158L228 177" />
            <path
              className="orbital-accent orbital-accent-soft"
              d="M395 286L416 303L395 322"
            />
          </g>
        </svg>
      </div>
      <section className="chat-main">
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="msg-row bot">
              <div className="bot-avatar" aria-hidden="true">
                <div className="bot-avatar-shell">
                  <ThroughlineLogo compact iconOnly />
                </div>
              </div>
              <div className="bubble bot">
                <div className="welcome-intro">Hi — I&apos;m Throughline.</div>
                Paste a privacy notice, upload a screenshot, or describe what you
                saw. I&apos;ll analyse it through the <strong>PNSA framework</strong>
                , mapping what the nudge reveals and hides across three levels of
                situational awareness, and give you a clear verdict.
                <ul className="welcome-list">
                  <li>
                    <strong>Level 1 · Perception</strong> what is the notice
                    actually doing right now?
                  </li>
                  <li>
                    <strong>Level 2 · Comprehension</strong> what do those facts
                    mean in context?
                  </li>
                  <li>
                    <strong>Level 3 · Projection</strong> where does this
                    trajectory lead over time?
                  </li>
                  <li>Benchmarked against GDPR and CCPA disclosure requirements</li>
                </ul>
                <div className="welcome-cta">
                  Choose an input method below or just start typing.
                </div>
              </div>
            </div>
          ) : null}

          {messages.map((message, index) =>
            message.role === "user" ? (
              <div key={message.id} className="msg-row user">
                <div className="bubble user">
                  <p>{message.content}</p>
                </div>
              </div>
            ) : message.role === "assistant_note" ? (
              <div key={message.id} className="msg-row bot">
                <div className="bot-avatar" aria-hidden="true">
                  <div className="bot-avatar-shell">
                    <ThroughlineLogo compact iconOnly />
                  </div>
                </div>
                <div className="bubble bot analysis-bubble">
                  <div className="welcome-intro">{message.title}</div>
                  <p>{message.content}</p>
                </div>
              </div>
            ) : (
              <div key={message.id} className="msg-row bot">
                <div className="bot-avatar" aria-hidden="true">
                  <div className="bot-avatar-shell">
                    <ThroughlineLogo compact iconOnly />
                  </div>
                </div>
                <div className="assistant-response">
                  <VerdictCard
                    analysis={message.analysis}
                    selectedAction={message.verdictAction}
                  />
                  <div className="bubble bot analysis-bubble">
                    <div className="analysis-divider">
                      <div className="analysis-divider-line" />
                      <div className="analysis-divider-text">
                        PNSA Consequence Analysis
                      </div>
                      <div className="analysis-divider-line" />
                    </div>
                    <div className="asymmetry-badge">Information asymmetry detected</div>
                    <ExpandableText
                      text={message.analysis.summary}
                      maxLines={4}
                      className="assistant-summary"
                    />
                    <div className="tiers">
                      {tierMeta.map((tier) => (
                        <div key={tier.key} className={`tier ${tier.className}`}>
                          <div className="tier-meta">
                            <div className="tier-sa-badge">{tier.badge}</div>
                            <div className="tier-label">{tier.label}</div>
                            <div className="tier-phase">{tier.phase}</div>
                          </div>
                          <ExpandableText
                            text={message.analysis.impacts[tier.key]}
                            maxLines={3}
                            className="tier-text"
                          />
                        </div>
                      ))}
                    </div>
                    <ExpandableText
                      text={message.analysis.rationale}
                      maxLines={3}
                      className="analysis-rationale"
                    />
                    <div className="response-actions">
                      {message.analysis.userOptions.map((option) => (
                        <button
                          key={option.id}
                          className="action-btn"
                          type="button"
                          onClick={() =>
                            handleUserOption(
                              option.id,
                              getOriginalPrompt(messages, index, message.analysis.summary),
                              message.analysis
                            )
                          }
                        >
                          {option.label}
                        </button>
                      ))}
                      <button className="react-btn" type="button" aria-label="Helpful">
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {isGenerating ? <GeneratingIndicator /> : null}
          <div ref={messagesEndRef} />
        </div>

        <section className="input-bar">
          <div className="input-bar-header">
            <button
              type="button"
              className="new-analysis-btn"
              onClick={resetConversation}
            >
              + New Analysis
            </button>
            <div className="nav-tag subtle">Nothing is stored after your session ends</div>
          </div>
          <div className="mode-row" role="tablist" aria-label="Input modes">
            {(["text", "screenshot", "voice"] as InputMode[]).map((mode) => (
              <button
                key={mode}
                className={mode === activeMode ? "mode-pill active" : "mode-pill"}
                type="button"
                role="tab"
                aria-selected={mode === activeMode}
                onClick={() => setActiveMode(mode)}
              >
                {mode[0].toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <p className="input-description">{modeDescriptions[activeMode]}</p>

          {activeMode === "text" ? (
            <div className="input-panel visible">
              <textarea
                className="text-field"
                placeholder="What is this app asking for, and should I accept it?"
                rows={1}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
              <div className="input-actions">
                <button
                  type="button"
                  className="mode-pill"
                  onClick={() =>
                    setPrompt(
                      "This app wants my location all the time so it can personalize nearby offers and share analytics with partners."
                    )
                  }
                >
                  Sample
                </button>
                <button
                  type="button"
                  className="send-btn"
                  onClick={submitPrompt}
                  disabled={isGenerating}
                  aria-label={isGenerating ? "Analyzing" : "Analyze request"}
                >
                  →
                </button>
              </div>
            </div>
          ) : null}

          {activeMode === "screenshot" ? (
            <div className="input-panel visible">
              <ScreenshotUploader
                disabled={isGenerating}
                onSubmit={submitScreenshotAnalysis}
              />
            </div>
          ) : null}

          {activeMode === "voice" ? (
            <div className="input-panel visible">
              <VoiceRecorder
                disabled={isGenerating}
                onSubmit={submitVoiceTranscript}
              />
            </div>
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
