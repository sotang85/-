import { sha256Hash } from "@/lib/utils/hash";
import type { OpenDartNormalized, ProviderResult } from "@/lib/providers/types";

const OPENDART_ENDPOINT = "https://opendart.fss.or.kr/api/company.json";

export async function fetchOpenDart(
  bizRegNo: string
): Promise<ProviderResult<OpenDartNormalized>> {
  const apiKey = process.env.OPENDART_API_KEY;
  const checkedAt = new Date();

  if (!apiKey) {
    const normalized: OpenDartNormalized = {
      is_listed: "not_applicable",
      last_checked_at: checkedAt.toISOString()
    };

    return {
      provider_name: "OpenDART",
      normalized,
      raw_hash_sha256: sha256Hash(JSON.stringify(normalized)),
      checked_at: checkedAt,
      status: "disabled",
      message: "OPENDART_API_KEY missing"
    };
  }

  try {
    const response = await fetch(
      `${OPENDART_ENDPOINT}?crtfc_key=${apiKey}&biz_no=${bizRegNo}`
    );

    if (!response.ok) {
      throw new Error(`OpenDART response ${response.status}`);
    }

    const data = (await response.json()) as {
      status?: string;
      message?: string;
      corp_code?: string;
      corp_cls?: string;
      corp_name?: string;
    };

    if (data.status !== "000") {
      const normalized: OpenDartNormalized = {
        is_listed: "not_applicable",
        last_checked_at: checkedAt.toISOString()
      };

      return {
        provider_name: "OpenDART",
        normalized,
        raw_hash_sha256: sha256Hash(JSON.stringify(data)),
        checked_at: checkedAt,
        status: "not_applicable",
        message: data.message
      };
    }

    const normalized: OpenDartNormalized = {
      is_listed: data.corp_cls === "Y" || data.corp_cls === "K",
      corp_code: data.corp_code,
      last_disclosure_date: undefined,
      last_checked_at: checkedAt.toISOString()
    };

    return {
      provider_name: "OpenDART",
      normalized,
      raw_hash_sha256: sha256Hash(JSON.stringify(data)),
      checked_at: checkedAt,
      status: "ok"
    };
  } catch (error) {
    const normalized: OpenDartNormalized = {
      is_listed: "not_applicable",
      last_checked_at: checkedAt.toISOString()
    };

    return {
      provider_name: "OpenDART",
      normalized,
      raw_hash_sha256: sha256Hash(JSON.stringify({ error: String(error) })),
      checked_at: checkedAt,
      status: "error",
      message: "Failed to fetch OpenDART"
    };
  }
}
