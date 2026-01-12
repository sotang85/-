import { sha256Hash } from "@/lib/utils/hash";
import type { G2bNormalized, ProviderResult } from "@/lib/providers/types";

export async function fetchG2bSanctions(
  _bizRegNo: string
): Promise<ProviderResult<G2bNormalized>> {
  const checkedAt = new Date();
  const normalized: G2bNormalized = {
    has_sanction: "unknown",
    sanction_valid: "unknown",
    last_checked_at: checkedAt.toISOString()
  };

  return {
    provider_name: "G2B",
    normalized,
    raw_hash_sha256: sha256Hash(JSON.stringify(normalized)),
    checked_at: checkedAt,
    status: "not_applicable",
    message: "G2B provider scaffold only"
  };
}
