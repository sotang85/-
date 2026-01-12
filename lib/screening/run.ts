import { prisma } from "@/lib/db";
import { fetchNtsStatus } from "@/lib/providers/nts";
import { fetchOpenDart } from "@/lib/providers/opendart";
import { fetchG2bSanctions } from "@/lib/providers/g2b";
import { runScoring } from "@/lib/scoring/scoring";
import type { ProviderResult } from "@/lib/providers/types";

const CACHE_WINDOW_MS = 24 * 60 * 60 * 1000;

async function getCachedEvidence(providerName: string, vendorId: string) {
  const latest = await prisma.evidenceSnapshot.findFirst({
    where: {
      provider_name: providerName,
      screening_run: {
        vendor_id: vendorId
      }
    },
    orderBy: {
      checked_at: "desc"
    }
  });

  if (!latest) return null;
  const ageMs = Date.now() - latest.checked_at.getTime();
  if (ageMs > CACHE_WINDOW_MS) return null;
  return latest;
}

async function resolveProviderResult<T>(params: {
  providerName: string;
  vendorId: string;
  fetcher: () => Promise<ProviderResult<T>>;
}): Promise<ProviderResult<T>> {
  const cache = await getCachedEvidence(params.providerName, params.vendorId);
  if (cache) {
    return {
      provider_name: params.providerName as ProviderResult<T>["provider_name"],
      normalized: cache.normalized_json as T,
      raw_hash_sha256: cache.raw_hash_sha256,
      checked_at: cache.checked_at,
      status: (cache.status as ProviderResult<T>["status"]) ?? "ok",
      message: cache.message ?? "cache hit"
    };
  }

  return params.fetcher();
}

export async function runScreening(vendorId: string, actor: string) {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw new Error("Vendor not found");

  const ntsResult = await resolveProviderResult({
    providerName: "NTS",
    vendorId,
    fetcher: () => fetchNtsStatus(vendor.biz_reg_no)
  });

  const openDartResult = await resolveProviderResult({
    providerName: "OpenDART",
    vendorId,
    fetcher: () => fetchOpenDart(vendor.biz_reg_no)
  });

  const g2bResult = await resolveProviderResult({
    providerName: "G2B",
    vendorId,
    fetcher: () => fetchG2bSanctions(vendor.biz_reg_no)
  });

  const scoring = runScoring({
    vendor,
    nts: ntsResult.normalized,
    g2b: g2bResult.normalized,
    openDart: openDartResult.normalized
  });

  const nextReviewAt = new Date();
  nextReviewAt.setMonth(nextReviewAt.getMonth() + scoring.nextReviewMonths);

  const run = await prisma.screeningRun.create({
    data: {
      vendor_id: vendor.id,
      run_by: actor,
      overall_grade: scoring.grade,
      recommendation:
        scoring.recommendation === "Go"
          ? "Go"
          : scoring.recommendation === "No-Go"
            ? "NoGo"
            : "ConditionalGo",
      score_total: scoring.scoreTotal,
      score_breakdown_json: scoring.breakdown,
      red_flags_json: scoring.redFlags,
      next_review_at: nextReviewAt
    }
  });

  await prisma.evidenceSnapshot.createMany({
    data: [
      {
        screening_run_id: run.id,
        provider_name: ntsResult.provider_name,
        status: ntsResult.status,
        message: ntsResult.message,
        normalized_json: ntsResult.normalized,
        raw_hash_sha256: ntsResult.raw_hash_sha256,
        checked_at: ntsResult.checked_at
      },
      {
        screening_run_id: run.id,
        provider_name: openDartResult.provider_name,
        status: openDartResult.status,
        message: openDartResult.message,
        normalized_json: openDartResult.normalized,
        raw_hash_sha256: openDartResult.raw_hash_sha256,
        checked_at: openDartResult.checked_at
      },
      {
        screening_run_id: run.id,
        provider_name: g2bResult.provider_name,
        status: g2bResult.status,
        message: g2bResult.message,
        normalized_json: g2bResult.normalized,
        raw_hash_sha256: g2bResult.raw_hash_sha256,
        checked_at: g2bResult.checked_at
      }
    ]
  });

  await prisma.auditLog.create({
    data: {
      actor,
      action: "screening_run",
      entity_type: "ScreeningRun",
      entity_id: run.id,
      metadata_json: {
        vendor_id: vendor.id,
        vendor_name: vendor.vendor_name
      }
    }
  });

  return { run, scoring };
}
