import { ThroughlineLogo } from "@/components/brand/throughline-logo";

export function GeneratingIndicator() {
  return (
    <div className="glass-panel generating-card">
      <div className="spinner-shell">
        <div className="spinner-rotate">
          <ThroughlineLogo compact />
        </div>
      </div>
      <div>
        <p className="eyebrow">Throughline</p>
        <h3>Generating response</h3>
        <p className="muted">
          Mapping immediate, short-term, and long-term consequences.
        </p>
      </div>
    </div>
  );
}

