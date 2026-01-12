import type { G2bNormalized, NtsNormalized, OpenDartNormalized } from "@/lib/providers/types";
import type { Vendor } from "@prisma/client";

export type ScreeningInputs = {
  vendor: Vendor;
  nts: NtsNormalized;
  g2b: G2bNormalized;
  openDart: OpenDartNormalized;
};

export type ScoreBreakdown = {
  inherent: number;
  external: number;
  controlGap: number;
};

export type RedFlag = {
  code: string;
  description: string;
};

export type RecommendationResult = {
  scoreTotal: number;
  grade: "Low" | "Medium" | "High";
  recommendation: "Go" | "Conditional Go" | "No-Go";
  redFlags: RedFlag[];
  breakdown: ScoreBreakdown;
  recommendedActions: string[];
  nextReviewMonths: number;
};
