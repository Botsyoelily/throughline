import Link from "next/link";

import { AccessTokenForm } from "@/components/auth/access-token-form";
import { ThroughlineLogo } from "@/components/brand/throughline-logo";

const featureTags = [
  "PNSA Framework",
  "Temporal Projection",
  "GDPR · CCPA",
  "Info Asymmetry"
];

const showDevelopmentToken = process.env.NODE_ENV !== "production";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-panel">
        <ThroughlineLogo />
        <h1 className="hero-headline">
          See the full
          <br />
          <em>consequence</em>
          <br />
          of every click.
        </h1>
        <p className="hero-sub">
          Throughline bridges the gap between what privacy nudges show you and
          what they do not. Paste a notice, upload a screenshot, or speak it and
          get a PNSA-structured consequence analysis in seconds.
        </p>
        <div className="feature-tags">
          {featureTags.map((item) => (
            <span key={item} className="tag">
              {item}
            </span>
          ))}
        </div>
        {showDevelopmentToken ? (
          <p className="dev-token-note">
            Local development token: <code>throughline-local-demo</code>
          </p>
        ) : null}
        <Link className="preview-link" href="/chat?preview=1">
          Preview the chat workspace
        </Link>
      </section>
      <AccessTokenForm />
    </main>
  );
}
