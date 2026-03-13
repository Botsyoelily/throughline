import { getAnthropicApiKey, getAnthropicModel } from "@/lib/security/env";
import type { AnalysisResponse, InputMode } from "@/lib/types";
import { analysisResponseSchema } from "@/lib/validation/analysis";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const PROVIDER_TIMEOUT_MS = 20_000;

const SYSTEM_PROMPT = `You are Throughline, a privacy nudge analysis engine.

Your job is to evaluate a privacy request, permission prompt, cookie notice, or policy excerpt and return a strict JSON object only.

Requirements:
- Analyze the user's input through a PNSA lens.
- Be concrete and specific to the supplied prompt.
- Do not mention being an AI model.
- Never output markdown.
- Never output prose outside the JSON object.
- Keep output concise and within the schema limits.

Schema:
{
  "summary": string,
  "recommendation": "decline" | "accept_with_caution" | "safe_to_accept",
  "rationale": string,
  "confidence": integer from 0 to 100,
  "impacts": {
    "immediate": string,
    "shortTerm": string,
    "longTerm": string
  },
  "userOptions": [
    { "id": "dig_deeper", "label": "Dig deeper" },
    { "id": "my_rights", "label": "My rights" },
    { "id": "analyze_another", "label": "Analyze another" }
  ]
}`;

type AnthropicTextBlock = {
  type: "text";
  text: string;
};

type AnthropicResponse = {
  content?: AnthropicTextBlock[];
  error?: {
    message?: string;
  };
};

export class AnalysisProviderError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = "AnalysisProviderError";
    this.statusCode = statusCode;
  }
}

function buildUserPrompt(prompt: string, source: InputMode) {
  return `Input source: ${source}

User content:
"""${prompt.trim()}"""

Return only the JSON object.`;
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new AnalysisProviderError("Model response did not include valid JSON.");
  }

  return trimmed.slice(firstBrace, lastBrace + 1);
}

async function fetchClaudeAnalysis(prompt: string, source: InputMode) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getAnthropicApiKey(),
        "anthropic-version": ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: getAnthropicModel(),
        max_tokens: 700,
        temperature: 0,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildUserPrompt(prompt, source)
          }
        ]
      }),
      signal: controller.signal
    });

    const payload = (await response.json()) as AnthropicResponse;

    if (!response.ok) {
      throw new AnalysisProviderError(
        payload.error?.message || "Claude analysis request failed.",
        response.status >= 500 ? 502 : response.status
      );
    }

    const text = payload.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!text) {
      throw new AnalysisProviderError("Claude returned an empty analysis response.");
    }

    return text;
  } catch (error) {
    if (error instanceof AnalysisProviderError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AnalysisProviderError("Claude analysis timed out.", 504);
    }

    throw new AnalysisProviderError("Unable to reach Claude.", 503);
  } finally {
    clearTimeout(timeout);
  }
}

export async function analyzeTextPrompt(
  prompt: string,
  source: InputMode
): Promise<AnalysisResponse> {
  const rawText = await fetchClaudeAnalysis(prompt, source);

  try {
    const parsed = JSON.parse(extractJson(rawText)) as unknown;
    return analysisResponseSchema.parse(parsed);
  } catch {
    throw new AnalysisProviderError(
      "Claude returned a response that did not match the analysis schema."
    );
  }
}
