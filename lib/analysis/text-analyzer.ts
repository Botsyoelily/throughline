import { getAnthropicApiKey, getAnthropicModel } from "@/lib/security/env";
import type {
  AnalysisResponse,
  InputMode,
  Recommendation,
  UserOption
} from "@/lib/types";
import { analysisResponseSchema } from "@/lib/validation/analysis";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_PROVIDER_TIMEOUT_MS = 20_000;
const SCREENSHOT_PROVIDER_TIMEOUT_MS = 35_000;
const MAX_PROMPT_CHARS = 2_000;
const MAX_SCREENSHOT_PROMPT_CHARS = 1_400;

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

const FOLLOW_UP_SYSTEM_PROMPT = `You are Throughline, a privacy guidance assistant.

Return a JSON object only with this exact shape:
{
  "title": string,
  "content": string
}

Requirements:
- No markdown.
- No prose outside the JSON object.
- Be concrete and practical.
- Keep title under 60 characters.
- Keep content under 500 characters.
- If the follow-up is "dig_deeper", explain what to inspect next in this specific privacy request.
- If the follow-up is "my_rights", explain the likely user rights and controls relevant to this request in plain language without legal overclaiming.`;

type AnthropicTextBlock = {
  type: "text";
  text: string;
};

type AnthropicImageBlock = {
  type: "image";
  source: {
    data: string;
    media_type: "image/png" | "image/jpeg" | "image/webp";
    type: "base64";
  };
};

type AnthropicResponse = {
  content?: AnthropicTextBlock[];
  error?: {
    message?: string;
  };
};

type FollowUpResponse = {
  content: string;
  title: string;
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
  const normalizedPrompt = normalizePrompt(prompt, source);

  return `Input source: ${source}

User content:
"""${normalizedPrompt}"""

Return only the JSON object.`;
}

function normalizePrompt(prompt: string, source: InputMode) {
  const collapsed = prompt.trim().replace(/\s+/g, " ");
  const maxLength =
    source === "screenshot" ? MAX_SCREENSHOT_PROMPT_CHARS : MAX_PROMPT_CHARS;

  return collapsed.length > maxLength
    ? `${collapsed.slice(0, maxLength - 1).trimEnd()}…`
    : collapsed;
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

function trimToLength(value: unknown, max: number, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

function normalizeRecommendation(value: unknown): Recommendation {
  if (value === "decline" || value === "accept_with_caution" || value === "safe_to_accept") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");

    if (normalized.includes("caution")) {
      return "accept_with_caution";
    }

    if (normalized.includes("safe") || normalized.includes("accept")) {
      return "safe_to_accept";
    }
  }

  return "accept_with_caution";
}

function normalizeConfidence(value: unknown) {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : 70;

  if (!Number.isFinite(numeric)) {
    return 70;
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeUserOptions(): UserOption[] {
  return [
    { id: "dig_deeper", label: "Dig deeper" },
    { id: "my_rights", label: "My rights" },
    { id: "analyze_another", label: "Analyze another" }
  ];
}

function normalizeAnalysisResponse(input: unknown): AnalysisResponse {
  const raw = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const impacts =
    typeof raw.impacts === "object" && raw.impacts !== null
      ? (raw.impacts as Record<string, unknown>)
      : {};

  const recommendation = normalizeRecommendation(raw.recommendation);

  const normalized: AnalysisResponse = {
    summary: trimToLength(
      raw.summary,
      700,
      "This privacy request changes how your data may be used, so it should be reviewed carefully before you continue."
    ),
    recommendation,
    rationale: trimToLength(
      raw.rationale,
      600,
      recommendation === "decline"
        ? "The request appears broader than necessary for the feature being offered."
        : recommendation === "safe_to_accept"
          ? "The request appears closer to a core product or security function."
          : "The request presents a meaningful privacy tradeoff that should be accepted deliberately."
    ),
    confidence: normalizeConfidence(raw.confidence),
    impacts: {
      immediate: trimToLength(
        impacts.immediate,
        500,
        "Granting this request would change what the service can collect or infer right away."
      ),
      shortTerm: trimToLength(
        impacts.shortTerm,
        500,
        "The collected data may soon affect personalization, analytics, sharing, or product behavior."
      ),
      longTerm: trimToLength(
        impacts.longTerm,
        500,
        "Over time, repeated collection can increase exposure through retention, reuse, or profiling."
      )
    },
    userOptions: normalizeUserOptions()
  };

  return analysisResponseSchema.parse(normalized);
}

async function fetchClaudeAnalysis(prompt: string, source: InputMode) {
  return fetchClaudeText({
    system: SYSTEM_PROMPT,
    userContent: buildUserPrompt(prompt, source),
    timeoutMs:
      source === "screenshot" ? SCREENSHOT_PROVIDER_TIMEOUT_MS : DEFAULT_PROVIDER_TIMEOUT_MS
  });
}

async function fetchClaudeText({
  system,
  userContent,
  timeoutMs = DEFAULT_PROVIDER_TIMEOUT_MS
}: {
  system: string;
  userContent: string | Array<AnthropicTextBlock | AnthropicImageBlock>;
  timeoutMs?: number;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

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
        max_tokens: 1500,
        temperature: 0,
        system,
        messages: [
          {
            role: "user",
            content: userContent
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

function normalizeFollowUpResponse(input: unknown, fallbackTitle: string): FollowUpResponse {
  const raw = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};

  return {
    title: trimToLength(raw.title, 60, fallbackTitle),
    content: trimToLength(
      raw.content,
      500,
      "Review the request carefully, inspect the privacy notice, and compare the requested data use against the feature you are actually trying to use."
    )
  };
}

export async function analyzeTextPrompt(
  prompt: string,
  source: InputMode
): Promise<AnalysisResponse> {
  const rawText = await fetchClaudeAnalysis(prompt, source);

  try {
    const parsed = JSON.parse(extractJson(rawText)) as unknown;
    return normalizeAnalysisResponse(parsed);
  } catch {
    throw new AnalysisProviderError(
      "Claude returned a response that did not match the analysis schema."
    );
  }
}

export async function analyzeScreenshot({
  fileBuffer,
  mimeType,
  note
}: {
  fileBuffer: ArrayBuffer;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  note?: string;
}): Promise<AnalysisResponse> {
  const base64Image = Buffer.from(fileBuffer).toString("base64");
  const normalizedNote =
    typeof note === "string" && note.trim().length > 0
      ? trimToLength(note, 500, "")
      : "";

  const rawText = await fetchClaudeText({
    system: SYSTEM_PROMPT,
    timeoutMs: SCREENSHOT_PROVIDER_TIMEOUT_MS,
    userContent: [
      {
        type: "text",
        text: `Input source: screenshot

Analyze the privacy notice, prompt, or consent interface shown in this image.
${normalizedNote ? `\nOptional user note:\n"""${normalizedNote}"""\n` : ""}
Return only the JSON object.`
      },
      {
        type: "image",
        source: {
          type: "base64",
          media_type: mimeType,
          data: base64Image
        }
      }
    ]
  });

  try {
    const parsed = JSON.parse(extractJson(rawText)) as unknown;
    return normalizeAnalysisResponse(parsed);
  } catch {
    throw new AnalysisProviderError(
      "Claude returned a response that did not match the analysis schema."
    );
  }
}

export async function analyzeFollowUp({
  optionId,
  originalPrompt,
  summary,
  rationale,
  recommendation
}: {
  optionId: "dig_deeper" | "my_rights";
  originalPrompt: string;
  summary: string;
  rationale: string;
  recommendation: Recommendation;
}): Promise<FollowUpResponse> {
  const fallbackTitle = optionId === "dig_deeper" ? "Dig Deeper" : "My Rights";
  const userContent = `Follow-up type: ${optionId}

Original privacy request:
"""${originalPrompt.trim()}"""

Current Throughline summary:
"""${summary.trim()}"""

Current recommendation: ${recommendation}
Current rationale:
"""${rationale.trim()}"""

Return only the JSON object.`;

  const rawText = await fetchClaudeText({
    system: FOLLOW_UP_SYSTEM_PROMPT,
    userContent,
    timeoutMs: DEFAULT_PROVIDER_TIMEOUT_MS
  });

  try {
    const parsed = JSON.parse(extractJson(rawText)) as unknown;
    return normalizeFollowUpResponse(parsed, fallbackTitle);
  } catch {
    throw new AnalysisProviderError(
      "Claude returned a response that did not match the follow-up schema."
    );
  }
}
