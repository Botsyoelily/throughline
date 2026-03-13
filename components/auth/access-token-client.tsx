"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AccessTokenClient() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/access-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ accessToken })
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to enter Throughline.");
        return;
      }

      router.push("/chat");
      router.refresh();
    } catch {
      setError("Unable to contact the secure access service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <p className="auth-label">Research Preview · v0.1</p>
      <h2 className="auth-title">Access Throughline</h2>
      <p className="auth-desc">
        Enter your research access token to begin analysing privacy nudges and
        their hidden consequences.
      </p>

      <label className="field-label" htmlFor="access-token">
        Access Token
      </label>
      <div className="token-input-wrap">
        <input
          id="access-token"
          className="token-input"
          type={isVisible ? "text" : "password"}
          name="accessToken"
          autoComplete="off"
          placeholder="tk_••••••••••••••••"
          value={accessToken}
          onChange={(event) => setAccessToken(event.target.value)}
        />
        <button
          type="button"
          className="token-eye"
          aria-label={isVisible ? "Hide access token" : "Show access token"}
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
      <p className="token-hint">Provided by your research coordinator</p>

      <button type="submit" className="cta-btn" disabled={isSubmitting}>
        {isSubmitting ? "Verifying..." : "Enter Throughline →"}
      </button>

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
    </form>
  );
}
