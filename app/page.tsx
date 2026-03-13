import Link from "next/link";

import { AccessTokenForm } from "@/components/auth/access-token-form";
import { ThroughlineLogo } from "@/components/brand/throughline-logo";

const valueProps = [
  "Translate privacy prompts into plain-language consequences.",
  "Project what changes immediately, soon after, and over time.",
  "Recommend a path without taking the decision away from the user."
];

export default function LandingPage() {
  return (
    <main className="landing-shell">
      <section className="landing-copy">
        <ThroughlineLogo />
        <p className="eyebrow">Privacy nudge copilot</p>
        <h1>See where your data goes before you agree.</h1>
        <p className="hero-copy">
          Throughline helps users evaluate privacy requests through text,
          screenshots, and voice, then returns a concise explanation and a
          recommendation grounded in downstream consequences.
        </p>
        <ul className="value-list">
          {valueProps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="muted small">
          Local development token: <code>throughline-local-demo</code>
        </p>
        <Link className="inline-link" href="/chat?preview=1">
          Preview the chat workspace
        </Link>
      </section>
      <AccessTokenForm />
    </main>
  );
}
