import { NextResponse } from "next/server";

import { AnalysisProviderError, analyzeTextPrompt } from "@/lib/analysis/text-analyzer";
import { ensureSameOrigin } from "@/lib/security/origin";
import { getValidatedSessionToken, unauthorizedResponse } from "@/lib/security/request-session";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

async function hasAllowedSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47;
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  return isPng || isJpeg || isWebp;
}

export async function POST(request: Request) {
  const sameOriginError = ensureSameOrigin(request);

  if (sameOriginError) {
    return sameOriginError;
  }

  const sessionToken = await getValidatedSessionToken(request);

  if (!sessionToken) {
    return unauthorizedResponse();
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const extractedText = formData.get("extractedText");
  const note = formData.get("note");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Attach a screenshot to analyze." },
      { status: 400 }
    );
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json(
      { error: "Use PNG, JPEG, or WebP screenshots only." },
      { status: 400 }
    );
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "Screenshot must be under 5 MB." }, { status: 400 });
  }

  if (!(await hasAllowedSignature(file))) {
    return NextResponse.json(
      { error: "Uploaded file content does not match a supported image format." },
      { status: 400 }
    );
  }

  const candidateText =
    typeof extractedText === "string" && extractedText.trim().length >= 10
      ? extractedText.trim()
      : typeof note === "string" && note.trim().length >= 10
        ? note.trim()
        : "";

  if (!candidateText) {
    return NextResponse.json(
      {
        error:
          "Throughline could not extract enough text from the screenshot. Add a short note describing the request."
      },
      { status: 400 }
    );
  }

  try {
    const normalizedPrompt = `Screenshot prompt: ${candidateText}`;
    const analysis = await analyzeTextPrompt(normalizedPrompt, "screenshot");
    return NextResponse.json({ ...analysis, source: "image" });
  } catch (error) {
    if (error instanceof AnalysisProviderError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Unexpected analysis failure." },
      { status: 500 }
    );
  }
}
