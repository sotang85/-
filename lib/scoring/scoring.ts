import type { ScreeningInputs, RecommendationResult, RedFlag, ScoreBreakdown } from "@/lib/scoring/types";

function scoreInherent(vendor: ScreeningInputs["vendor"]): number {
  const typeScore = {
    IT: 10,
    agency: 8,
    logistics: 6,
    supplier: 5,
    other: 6
  }[vendor.vendor_type];

  const piiScore = {
    none: 0,
    limited: 8,
    high: 15
  }[vendor.pii_access_level];

  const advancePaymentScore = vendor.advance_payment ? 8 : 0;
  const publicProcurementScore = vendor.public_procurement_related ? 6 : 0;

  let spendScore = 2;
  if (vendor.expected_annual_spend !== null && vendor.expected_annual_spend !== undefined) {
    if (vendor.expected_annual_spend > 200_000_000) spendScore = 6;
    else if (vendor.expected_annual_spend >= 50_000_000) spendScore = 3;
    else spendScore = 1;
  }

  return typeScore + piiScore + advancePaymentScore + publicProcurementScore + spendScore;
}

function scoreExternal(inputs: ScreeningInputs, redFlags: RedFlag[]): number {
  let score = 0;
  const ntsStatus = inputs.nts.status;
  if (ntsStatus === "closed") {
    score += 30;
    redFlags.push({
      code: "NTS_CLOSED",
      description: "국세청 상태가 폐업으로 확인됨"
    });
  } else if (ntsStatus === "suspended") {
    score += 20;
  } else if (ntsStatus === "unknown") {
    score += 10;
  }

  const g2b = inputs.g2b;
  if (g2b.sanction_valid === true) {
    score += 30;
    redFlags.push({
      code: "G2B_SANCTION",
      description: "나라장터 제재 유효"
    });
  } else if (g2b.has_sanction === true) {
    score += 20;
  } else if (g2b.has_sanction === "unknown") {
    score += inputs.vendor.public_procurement_related ? 8 : 2;
  }

  const openDart = inputs.openDart;
  if (openDart.is_listed === "not_applicable") {
    score += 5;
  }

  return score;
}

function scoreControlGap(vendor: ScreeningInputs["vendor"]): number {
  let score = 0;
  if (
    vendor.advance_payment &&
    vendor.expected_annual_spend !== null &&
    vendor.expected_annual_spend !== undefined &&
    vendor.expected_annual_spend > 50_000_000
  ) {
    score += 6;
  } else if (vendor.advance_payment) {
    score += 2;
  }

  if (vendor.pii_access_level === "high") {
    score += 4;
  }

  return score;
}

function scoreGrade(total: number): "Low" | "Medium" | "High" {
  if (total >= 60) return "High";
  if (total >= 30) return "Medium";
  return "Low";
}

function getRecommendation(
  grade: "Low" | "Medium" | "High",
  redFlags: RedFlag[]
): "Go" | "Conditional Go" | "No-Go" {
  if (redFlags.length > 0) return "No-Go";
  if (grade === "Low") return "Go";
  return "Conditional Go";
}

function recommendedControls(
  grade: "Low" | "Medium" | "High",
  inputs: ScreeningInputs
): { actions: string[]; nextReviewMonths: number } {
  const actions: string[] = [
    "정기 재심사 일정에 따라 모니터링 수행",
    "거래처 기본정보 및 등록증 갱신 확인",
    "주요 변경사항 발생 시 즉시 재심사"
  ];
  let nextReviewMonths = 12;

  if (grade === "Medium") {
    nextReviewMonths = 6;
  }

  if (grade === "High") {
    nextReviewMonths = 3;
  }

  if (grade !== "Low") {
    actions.push(
      "계약서에 감사권, 위반 시 즉시 해지 조항을 포함",
      "개인정보 처리 위탁 시 데이터 처리 조항 및 하위수탁 제한",
      "선급금 한도 설정 및 성과보증/에스크로 검토"
    );
  }

  if (inputs.vendor.public_procurement_related || inputs.g2b.has_sanction === "unknown") {
    actions.push("제재 관련 추가 증빙(비제재 확인서 등) 제출 요구");
  }

  if (inputs.vendor.pii_access_level !== "none") {
    actions.push("개인정보 최소화 및 접근통제 검토");
  }

  if (grade === "High") {
    actions.push("경영진 승인 필요");
  }

  return { actions: actions.slice(0, 6), nextReviewMonths };
}

export function runScoring(inputs: ScreeningInputs): RecommendationResult {
  const redFlags: RedFlag[] = [];
  const breakdown: ScoreBreakdown = {
    inherent: scoreInherent(inputs.vendor),
    external: 0,
    controlGap: scoreControlGap(inputs.vendor)
  };

  breakdown.external = scoreExternal(inputs, redFlags);

  const scoreTotal = breakdown.inherent + breakdown.external + breakdown.controlGap;
  const grade = scoreGrade(scoreTotal);
  const recommendation = getRecommendation(grade, redFlags);
  const { actions, nextReviewMonths } = recommendedControls(grade, inputs);

  return {
    scoreTotal,
    grade,
    recommendation,
    redFlags,
    breakdown,
    recommendedActions: actions,
    nextReviewMonths
  };
}
