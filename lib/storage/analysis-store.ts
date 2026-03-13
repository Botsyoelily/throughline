import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AnalysisResponse } from "@/lib/types";

const dataDirectory = path.join(process.cwd(), "data");
const storePath = path.join(dataDirectory, "analyses.json");

export type StoredAnalysis = {
  id: string;
  sessionKey: string;
  source: "text" | "image" | "voice";
  prompt: string;
  createdAt: string;
  verdictAction?: "decline" | "accept_anyway" | "override";
  analysis: AnalysisResponse;
};

type StoreShape = {
  analyses: StoredAnalysis[];
};

async function ensureStore() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(storePath, "utf8");
  } catch {
    const initialData: StoreShape = { analyses: [] };
    await writeFile(storePath, JSON.stringify(initialData, null, 2), "utf8");
  }
}

async function loadStore() {
  await ensureStore();
  const raw = await readFile(storePath, "utf8");
  return JSON.parse(raw) as StoreShape;
}

async function saveStore(store: StoreShape) {
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function saveAnalysis(
  analysis: Omit<StoredAnalysis, "id" | "createdAt">
) {
  const store = await loadStore();
  const record: StoredAnalysis = {
    ...analysis,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  store.analyses.unshift(record);
  store.analyses = store.analyses.slice(0, 100);

  await saveStore(store);

  return record;
}

export async function listAnalysesForSession(sessionKey: string) {
  const store = await loadStore();
  return store.analyses.filter((analysis) => analysis.sessionKey === sessionKey);
}

export async function updateVerdictAction(
  sessionKey: string,
  analysisId: string,
  verdictAction: StoredAnalysis["verdictAction"]
) {
  const store = await loadStore();
  const record = store.analyses.find(
    (analysis) => analysis.id === analysisId && analysis.sessionKey === sessionKey
  );

  if (!record) {
    return null;
  }

  record.verdictAction = verdictAction;
  await saveStore(store);
  return record;
}

