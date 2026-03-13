import Link from "next/link";

import { AccessTokenForm } from "@/components/auth/access-token-form";
import { ThroughlineLogo } from "@/components/brand/throughline-logo";

const featureTags = [
  "PNSA Framework",
  "Temporal Projection",
  "GDPR · CCPA",
  "Info Asymmetry"
];

export default async function LandingPage({
  searchParams
}: {
  searchParams?: Promise<{ invite?: string | undefined }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const inviteStatus =
    resolvedSearchParams?.invite === "ready" ||
    resolvedSearchParams?.invite === "invalid" ||
    resolvedSearchParams?.invite === "missing" ||
    resolvedSearchParams?.invite === "rate_limited"
      ? resolvedSearchParams.invite
      : undefined;

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
        <Link className="preview-link" href="/chat?preview=1">
          Preview the chat workspace
        </Link>
      </section>
      <AccessTokenForm inviteStatus={inviteStatus} />
    </main>
  );
}
