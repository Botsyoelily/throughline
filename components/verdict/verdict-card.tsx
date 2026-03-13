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
  selectedAction
}: {
  analysis: AnalysisResponse;
  selectedAction?: VerdictAction;
}) {
  const meta = verdictMeta[analysis.recommendation];
  const action = analysis.recommendation === "accept_with_caution"
    ? null
    : analysis.recommendation === "decline"
      ? {
          id: "decline" as const,
          label: "Decline",
          className: "btn-decline"
        }
      : analysis.recommendation === "safe_to_accept"
        ? {
            id: "accept_anyway" as const,
            label: "Accept",
            className: "btn-accept"
          }
        : null;
  const showLowConfidenceNote = analysis.recommendation === "accept_with_caution";

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
            {showLowConfidenceNote ? (
              <div className="verdict-sub">Low-confidence recommendation · review manually</div>
            ) : null}
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
      {action ? (
        <div className="verdict-actions">
          <button
            className={`verdict-btn ${action.className} ${
              selectedAction === action.id ? "active-verdict" : ""
            }`}
            type="button"
            disabled
            aria-disabled="true"
          >
            {action.label}
          </button>
        </div>
      ) : null}
    </section>
  );
}
