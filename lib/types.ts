export type Recommendation =
  | "decline"
  | "accept_with_caution"
  | "safe_to_accept";

export type InputMode = "text" | "screenshot" | "voice";

export type UserOption = {
  id: "dig_deeper" | "my_rights" | "analyze_another";
  label: string;
};

export type AnalysisResponse = {
  id?: string;
  source?: "text" | "image" | "voice";
  summary: string;
  recommendation: Recommendation;
  rationale: string;
  confidence: number;
  impacts: {
    immediate: string;
    shortTerm: string;
    longTerm: string;
  };
  userOptions: UserOption[];
};

export type VerdictAction = "decline" | "accept_anyway" | "override";

export type StoredAnalysisClient = {
  id: string;
  prompt: string;
  source: "text" | "image" | "voice";
  createdAt: string;
  verdictAction?: VerdictAction;
  analysis: AnalysisResponse;
};
