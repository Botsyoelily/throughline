"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AccessTokenClient() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <form className="glass-panel access-card" onSubmit={handleSubmit}>
      <p className="eyebrow">Secure access</p>
      <h2>Enter your access token</h2>
      <label className="field">
        <span>Access token</span>
        <input
          type="password"
          name="accessToken"
          autoComplete="off"
          placeholder="Paste token"
          aria-describedby="token-help"
          value={accessToken}
          onChange={(event) => setAccessToken(event.target.value)}
        />
      </label>
      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? "Verifying..." : "Enter Throughline"}
      </button>
      <p id="token-help" className="muted small">
        Throughline interprets privacy prompts and recommends an action based on
        projected consequences.
      </p>
      <button type="button" className="text-button">
        Learn how Throughline evaluates requests
      </button>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

