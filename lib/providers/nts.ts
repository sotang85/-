import { sha256Hash } from "@/lib/utils/hash";
import type { NtsNormalized, ProviderResult } from "@/lib/providers/types";

// TODO: Verify official NTS endpoint params/fields for production use.
const NTS_ENDPOINT =
  "https://api.odcloud.kr/api/nts-businessman/v1/status";

function mapStatus(status: string | undefined): NtsNormalized["status"] {
  if (!status) return "unknown";
  const normalized = status.toLowerCase();
  if (normalized.includes("폐업") || normalized.includes("closed")) return "closed";
  if (normalized.includes("휴업") || normalized.includes("suspend")) {
    return "suspended";
  }
  if (normalized.includes("계속") || normalized.includes("active")) return "active";
  return "unknown";
}

export async function fetchNtsStatus(
  bizRegNo: string
): Promise<ProviderResult<NtsNormalized>> {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  const checkedAt = new Date();

  if (!apiKey) {
    const normalized: NtsNormalized = {
      status: "active",
      taxable_type: "general",
      last_checked_at: checkedAt.toISOString()
    };

    return {
      provider_name: "NTS",
      normalized,
      raw_hash_sha256: sha256Hash(JSON.stringify(normalized)),
      checked_at: checkedAt,
      status: "disabled",
      message: "DATA_GO_KR_API_KEY missing; using mock data"
    };
  }

  const payload = { b_no: [bizRegNo] };

  try {
    const response = await fetch(`${NTS_ENDPOINT}?serviceKey=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`NTS response ${response.status}`);
    }

    const data = (await response.json()) as {
      data?: Array<Record<string, string>>;
    };

    const item = data?.data?.[0];
    const normalized: NtsNormalized = {
      status: mapStatus(item?.b_stt),
      taxable_type: item?.tax_type,
      last_checked_at: checkedAt.toISOString()
    };

    return {
      provider_name: "NTS",
      normalized,
      raw_hash_sha256: sha256Hash(JSON.stringify(data)),
      checked_at: checkedAt,
      status: "ok"
    };
  } catch (error) {
    const normalized: NtsNormalized = {
      status: "unknown",
      last_checked_at: checkedAt.toISOString()
    };

    return {
      provider_name: "NTS",
      normalized,
      raw_hash_sha256: sha256Hash(JSON.stringify({ error: String(error) })),
      checked_at: checkedAt,
      status: "error",
      message: "Failed to fetch NTS status"
    };
  }
}
