import { sha256Hash } from "@/lib/utils/hash";
import type { G2bNormalized, ProviderResult } from "@/lib/providers/types";

// TODO: Confirm official G2B user info service endpoint/fields for production.
const G2B_ENDPOINT =
  "https://api.odcloud.kr/api/15077586/v1/uddi:7dd8b4b1-6b0a-4f07-9a02-7f6c1d7a9f3a";

function extractBoolean(input?: string | boolean | null): boolean | "unknown" {
  if (input === undefined || input === null) return "unknown";
  if (typeof input === "boolean") return input;
  const normalized = input.toString().trim().toLowerCase();
  if (["y", "yes", "true", "1"].includes(normalized)) return true;
  if (["n", "no", "false", "0"].includes(normalized)) return false;
  return "unknown";
}

export async function fetchG2bSanctions(
  bizRegNo: string
): Promise<ProviderResult<G2bNormalized>> {
  const apiKey = process.env.G2B_API_KEY;
  const checkedAt = new Date();

  if (!apiKey) {
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
      status: "disabled",
      message: "G2B_API_KEY missing"
    };
  }

  try {
    const response = await fetch(
      `${G2B_ENDPOINT}?serviceKey=${apiKey}&bizRegNo=${bizRegNo}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`G2B response ${response.status}`);
    }

    const data = (await response.json()) as {
      data?: Array<Record<string, unknown>>;
      response?: { body?: { items?: { item?: Record<string, unknown> | Record<string, unknown>[] } } };
    };

    const item =
      data?.data?.[0] ??
      (Array.isArray(data?.response?.body?.items?.item)
        ? data?.response?.body?.items?.item?.[0]
        : data?.response?.body?.items?.item);

    const hasSanction = extractBoolean(
      (item?.["sanction_yn"] as string | boolean | undefined) ??
        (item?.["sanc_yn"] as string | boolean | undefined)
    );

    const sanctionValid = extractBoolean(
      (item?.["sanction_valid"] as string | boolean | undefined) ??
        (item?.["sanc_valid"] as string | boolean | undefined)
    );

    const normalized: G2bNormalized = {
      has_sanction: hasSanction,
      sanction_valid: sanctionValid,
      last_checked_at: checkedAt.toISOString()
    };

    return {
      provider_name: "G2B",
      normalized,
      raw_hash_sha256: sha256Hash(JSON.stringify(data)),
      checked_at: checkedAt,
      status: "ok"
    };
  } catch (error) {
    const normalized: G2bNormalized = {
      has_sanction: "unknown",
      sanction_valid: "unknown",
      last_checked_at: checkedAt.toISOString()
    };

    return {
      provider_name: "G2B",
      normalized,
      raw_hash_sha256: sha256Hash(JSON.stringify({ error: String(error) })),
      checked_at: checkedAt,
      status: "error",
      message: "G2B 조회 실패"
    };
  }
}
