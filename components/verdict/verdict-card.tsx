import type { AnalysisResponse, VerdictAction } from "@/lib/types";

const verdictMeta: Record<
  AnalysisResponse["recommendation"],
  {
    cardClass: string;
    icon: string;
    headline: string;
    subline: string;
  }
> = {
  decline: {
    cardClass: "decline",
    icon: "🚫",
    headline: "Decline this notice",
    subline:
      "High information asymmetry · PNSA Level 3 projection confirms irreversible exposure"
  },
  accept_with_caution: {
    cardClass: "caution",
    icon: "⚠️",
    headline: "Proceed with caution",
    subline:
      "Material tradeoffs remain · review the projected effects before continuing"
  },
  safe_to_accept: {
    cardClass: "accept",
    icon: "✓",
    headline: "Safe to accept",
    subline:
      "Disclosure appears proportionate · projected downstream exposure stays bounded"
  }
};

export function VerdictCard({
  analysis,
  selectedAction,
  onAction
}: {
  analysis: AnalysisResponse;
  selectedAction?: VerdictAction;
  onAction?: (action: VerdictAction) => void;
}) {
  const meta = verdictMeta[analysis.recommendation];

  return (
    <section className={`verdict-card ${meta.cardClass}`} aria-label="Recommendation">
      <div className="verdict-header">
        <div className="verdict-left">
          <div className="verdict-icon" aria-hidden="true">
            {meta.icon}
          </div>
          <div>
            <div className="verdict-recommendation">Throughline recommends</div>
            <div className="verdict-headline">{meta.headline}</div>
            <div className="verdict-sub">{meta.subline}</div>
          </div>
        </div>
        <div className="confidence-wrap">
          <div className="confidence-label">Confidence</div>
          <div className="confidence-value">{analysis.confidence}%</div>
          <div className="confidence-track" aria-hidden="true">
            <div
              className="confidence-fill"
              style={{ width: `${analysis.confidence}%` }}
            />
          </div>
        </div>
      </div>
      <div className="verdict-actions">
        <button
          className={`verdict-btn btn-decline ${
            selectedAction === "decline" ? "active-verdict" : ""
          }`}
          type="button"
          onClick={() => onAction?.("decline")}
        >
          Decline
        </button>
        <button
          className={`verdict-btn btn-accept ${
            selectedAction === "accept_anyway" ? "active-verdict" : ""
          }`}
          type="button"
          onClick={() => onAction?.("accept_anyway")}
        >
          Accept anyway
        </button>
        <button
          className={`verdict-btn btn-override ${
            selectedAction === "override" ? "active-verdict" : ""
          }`}
          type="button"
          onClick={() => onAction?.("override")}
        >
          Override
        </button>
      </div>
    </section>
  );
}
