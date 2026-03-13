import type { AnalysisResponse, Recommendation } from "@/lib/types";
import { analysisResponseSchema } from "@/lib/validation/analysis";

const highRiskKeywords = [
  "track",
  "tracking",
  "third-party",
  "sell",
  "share",
  "partner",
  "ads",
  "advertising",
  "biometric"
];

const mediumRiskKeywords = [
  "location",
  "camera",
  "microphone",
  "contacts",
  "photos",
  "cookies",
  "analytics",
  "personalize",
  "background"
];

const safeKeywords = ["security", "fraud", "authentication", "login", "essential"];

function scorePrompt(prompt: string) {
  const text = prompt.toLowerCase();

  let score = 45;

  for (const keyword of highRiskKeywords) {
    if (text.includes(keyword)) {
      score += 18;
    }
  }

  for (const keyword of mediumRiskKeywords) {
    if (text.includes(keyword)) {
      score += 10;
    }
  }

  for (const keyword of safeKeywords) {
    if (text.includes(keyword)) {
      score -= 12;
    }
  }

  return Math.max(5, Math.min(score, 95));
}

function recommendationForScore(score: number): Recommendation {
  if (score >= 70) {
    return "decline";
  }

  if (score >= 45) {
    return "accept_with_caution";
  }

  return "safe_to_accept";
}

function rationaleForRecommendation(recommendation: Recommendation) {
  switch (recommendation) {
    case "decline":
      return "The request appears broader than necessary and likely enables avoidable data sharing or profiling.";
    case "accept_with_caution":
      return "The request may support a useful feature, but it also introduces meaningful privacy tradeoffs.";
    case "safe_to_accept":
      return "The request looks closer to functional or security-related use than broad secondary data use.";
  }
}

function summaryForRecommendation(recommendation: Recommendation, prompt: string) {
  const shortenedPrompt = prompt.trim().replace(/\s+/g, " ").slice(0, 120);

  switch (recommendation) {
    case "decline":
      return `This request likely expands data use beyond the immediate feature being offered. Accepting may unlock convenience, but it also increases tracking, sharing, or profiling linked to: "${shortenedPrompt}".`;
    case "accept_with_caution":
      return `This request may support a real product feature, but it also widens how your data can be observed or reused. The tradeoff is not necessarily unsafe, but it should be accepted deliberately for: "${shortenedPrompt}".`;
    case "safe_to_accept":
      return `This request appears tied to a core function or security need rather than broad downstream reuse. It still deserves review, but it presents a lower privacy risk in the context provided: "${shortenedPrompt}".`;
  }
}

export function analyzeTextPrompt(prompt: string): AnalysisResponse {
  const score = scorePrompt(prompt);
  const recommendation = recommendationForScore(score);
  const confidence = recommendation === "decline" ? Math.min(score + 4, 96) : 100 - Math.abs(50 - score);

  const response = {
    summary: summaryForRecommendation(recommendation, prompt),
    recommendation,
    rationale: rationaleForRecommendation(recommendation),
    confidence,
    impacts: {
      immediate:
        recommendation === "safe_to_accept"
          ? "The permission mainly affects the feature you are actively trying to use."
          : "Granting this request changes what the service can collect or infer right away.",
      shortTerm:
        recommendation === "decline"
          ? "The collected data can shape personalization, targeting, or internal sharing soon after consent."
          : "The service may begin using the data to refine features, analytics, or personalization over the next sessions.",
      longTerm:
        recommendation === "decline"
          ? "Over time, repeated collection can build a fuller profile that is harder to unwind later."
          : "Longer-term impact depends on retention, reuse, and whether the data stays tied to your account."
    },
    userOptions: [
      { id: "dig_deeper", label: "Dig deeper" },
      { id: "my_rights", label: "My rights" },
      { id: "analyze_another", label: "Analyze another" }
    ]
  } satisfies AnalysisResponse;

  return analysisResponseSchema.parse(response);
}

