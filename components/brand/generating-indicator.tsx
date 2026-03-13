export function GeneratingIndicator() {
  return (
    <div className="msg-row bot generating-row">
      <div className="bot-avatar generating" aria-hidden="true">
        <div className="gen-ring" />
        <div className="bot-avatar-core" />
      </div>
      <div className="bubble bot gen-bubble">
        <div className="gen-label">Generating</div>
        <div className="dot-wave" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
