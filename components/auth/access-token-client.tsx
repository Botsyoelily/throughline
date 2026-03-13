import Link from "next/link";

export function AccessTokenClient({
  inviteStatus
}: {
  inviteStatus?: "ready" | "invalid" | "missing" | "rate_limited";
}) {
  const error =
    inviteStatus === "ready"
      ? "Invite accepted. Click Enter Throughline to begin."
      : inviteStatus === "invalid"
      ? "That invite link is invalid or has expired."
      : inviteStatus === "missing"
        ? "Invite link is missing its token."
        : inviteStatus === "rate_limited"
          ? "Too many invite attempts. Wait a moment and try again."
          : "";

  return (
    <section className="auth-card">
      <p className="auth-label">Research Preview · v0.1</p>
      <h2 className="auth-title">Access Throughline</h2>
      <p className="auth-desc">
        Open your research invite link to unlock this session, then continue
        into Throughline from here.
      </p>
      <p className="token-hint">
        Invite links are signed server-side and do not expose model or session
        secrets to testers.
      </p>

      <Link className="cta-btn auth-link-btn" href="/chat">
        Enter Throughline →
      </Link>

      <div className="divider" aria-hidden="true">
        <div className="divider-line" />
        <div className="divider-text">or</div>
        <div className="divider-line" />
      </div>

      <Link className="guest-link" href="/chat?preview=1">
        Continue as <span>guest observer</span> — explore with sample data
      </Link>

      <div className="about-section">
        <div className="about-row">
          <div className="about-dot" />
          <p className="about-text">
            <strong>PNSA Level 1 · Perception</strong> reveals raw facts the
            notice omits right now
          </p>
        </div>
        <div className="about-row">
          <div className="about-dot" />
          <p className="about-text">
            <strong>PNSA Level 2 · Comprehension</strong> gives those facts
            operational meaning and context
          </p>
        </div>
        <div className="about-row">
          <div className="about-dot" />
          <p className="about-text">
            <strong>PNSA Level 3 · Projection</strong> extrapolates the
            trajectory into a long-term consequence forecast
          </p>
        </div>
      </div>

      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
