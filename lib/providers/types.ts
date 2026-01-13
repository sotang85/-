export type ProviderName = "NTS" | "OpenDART" | "G2B";

export type ProviderResult<TNormalized> = {
  provider_name: ProviderName;
  normalized: TNormalized;
  raw_hash_sha256: string;
  checked_at: Date;
  status: "ok" | "disabled" | "not_applicable" | "error";
  message?: string;
};

export type NtsNormalized = {
  status: "active" | "closed" | "suspended" | "unknown";
  taxable_type?: string;
  last_checked_at: string;
};

export type OpenDartNormalized = {
  is_listed: boolean | "not_applicable";
  corp_code?: string;
  last_disclosure_date?: string;
  last_checked_at: string;
};

export type G2bNormalized = {
  has_sanction: boolean | "unknown";
  sanction_valid: boolean | "unknown";
  last_checked_at: string;
};
