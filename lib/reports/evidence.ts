import type { EvidenceSnapshot, ScreeningRun, Vendor } from "@prisma/client";

export function buildEvidencePack(params: {
  vendor: Vendor;
  screening: ScreeningRun;
  snapshots: EvidenceSnapshot[];
}) {
  const { vendor, screening, snapshots } = params;
  return {
    vendor: {
      id: vendor.id,
      vendor_name: vendor.vendor_name,
      biz_reg_no: vendor.biz_reg_no,
      vendor_type: vendor.vendor_type,
      expected_annual_spend: vendor.expected_annual_spend,
      advance_payment: vendor.advance_payment,
      pii_access_level: vendor.pii_access_level,
      public_procurement_related: vendor.public_procurement_related
    },
    screening_run: {
      id: screening.id,
      run_at: screening.run_at,
      overall_grade: screening.overall_grade,
      recommendation: screening.recommendation,
      score_total: screening.score_total,
      score_breakdown: screening.score_breakdown_json,
      red_flags: screening.red_flags_json,
      next_review_at: screening.next_review_at
    },
    evidence_snapshots: snapshots.map((snapshot) => ({
      provider_name: snapshot.provider_name,
      normalized: snapshot.normalized_json,
      raw_hash_sha256: snapshot.raw_hash_sha256,
      checked_at: snapshot.checked_at
    })),
    disclaimers: [
      "본 증거팩은 제공된 API의 요약 정보를 기반으로 하며 원본 전체 응답을 저장하지 않습니다.",
      "외부 데이터는 조회 시점에 따라 변동될 수 있습니다.",
      "권고는 승인/보증이 아닙니다."
    ]
  };
}
