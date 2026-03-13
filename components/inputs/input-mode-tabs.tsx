import type { InputMode } from "@/lib/types";

const modeMeta: Array<{ id: InputMode; label: string; description: string }> = [
  {
    id: "text",
    label: "Text",
    description: "Paste a privacy prompt, consent request, or policy excerpt."
  },
  {
    id: "screenshot",
    label: "Screenshot",
    description: "Upload a screenshot so Throughline can inspect the exact prompt."
  },
  {
    id: "voice",
    label: "Voice",
    description: "Describe what the app is asking for and get spoken-context analysis."
  }
];

export function InputModeTabs({ activeMode }: { activeMode: InputMode }) {
  return (
    <section className="glass-panel input-tabs">
      <div className="pill-row" role="tablist" aria-label="Input modes">
        {modeMeta.map((mode) => (
          <button
            key={mode.id}
            className={mode.id === activeMode ? "pill active" : "pill"}
            type="button"
            role="tab"
            aria-selected={mode.id === activeMode}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <p className="muted">{modeMeta.find((mode) => mode.id === activeMode)?.description}</p>
      {activeMode === "text" ? (
        <div className="composer">
          <textarea
            placeholder="What is this app asking for, and should I accept it?"
            rows={4}
          />
          <div className="composer-actions">
            <button type="button" className="secondary-button">
              Voice shortcut
            </button>
            <button type="button" className="primary-button">
              Analyze request
            </button>
          </div>
        </div>
      ) : null}
      {activeMode === "screenshot" ? (
        <label className="upload-dropzone">
          <span>Drop a screenshot here or choose a file</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" />
        </label>
      ) : null}
      {activeMode === "voice" ? (
        <div className="voice-panel">
          <div className="wave-row" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <button type="button" className="primary-button">
            Start recording
          </button>
        </div>
      ) : null}
    </section>
  );
}

