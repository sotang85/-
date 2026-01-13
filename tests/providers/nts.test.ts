import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fetchNtsStatus } from "@/lib/providers/nts";

const originalEnv = { ...process.env };

describe("fetchNtsStatus", () => {
  beforeEach(() => {
    process.env = { ...originalEnv, DATA_GO_KR_API_KEY: "test-key" };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = originalEnv;
  });

  it("normalizes NTS response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          data: [
            {
              b_stt: "계속사업자",
              tax_type: "일반"
            }
          ]
        })
      })) as unknown as typeof fetch
    );

    const result = await fetchNtsStatus("1234567890");

    expect(result.normalized.status).toBe("active");
    expect(result.normalized.taxable_type).toBe("일반");
    expect(result.raw_hash_sha256.length).toBeGreaterThan(10);
  });
});
