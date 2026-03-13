import type { AnalysisResponse, VerdictAction } from "@/lib/types";

const verdictLabel: Record<AnalysisResponse["recommendation"], string> = {
  decline: "We suggest declining",
  accept_with_caution: "Proceed with caution",
  safe_to_accept: "Looks safe to accept"
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
  return (
    <section className="glass-panel verdict-card" aria-label="Recommendation">
      <div className="verdict-topline">
        <div>
          <p className="eyebrow">Throughline recommends</p>
          <h3>{verdictLabel[analysis.recommendation]}</h3>
          <p className="muted">{analysis.rationale}</p>
        </div>
        <div className="confidence-block">
          <span>{analysis.confidence}% confidence</span>
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
          className={
            selectedAction === "decline"
              ? "danger-button active-verdict"
              : "danger-button"
          }
          type="button"
          onClick={() => onAction?.("decline")}
        >
          Decline
        </button>
        <button
          className={
            selectedAction === "accept_anyway"
              ? "success-button active-verdict"
              : "success-button"
          }
          type="button"
          onClick={() => onAction?.("accept_anyway")}
        >
          Accept anyway
        </button>
        <button
          className={
            selectedAction === "override"
              ? "secondary-button active-verdict"
              : "secondary-button"
          }
          type="button"
          onClick={() => onAction?.("override")}
        >
          Override
        </button>
      </div>
    </section>
  );
}
