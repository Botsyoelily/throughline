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
