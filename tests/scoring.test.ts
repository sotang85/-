import { describe, expect, it } from "vitest";
import { runScoring } from "@/lib/scoring/scoring";
import type { Vendor } from "@prisma/client";
import type { G2bNormalized, NtsNormalized, OpenDartNormalized } from "@/lib/providers/types";

const baseVendor: Vendor = {
  id: "v1",
  vendor_name: "Test Vendor",
  biz_reg_no: "1234567890",
  vendor_type: "supplier",
  expected_annual_spend: 40_000_000,
  advance_payment: false,
  pii_access_level: "none",
  public_procurement_related: false,
  notes: null,
  created_at: new Date(),
  updated_at: new Date()
};

const baseNts: NtsNormalized = {
  status: "active",
  last_checked_at: new Date().toISOString()
};

const baseG2b: G2bNormalized = {
  has_sanction: false,
  sanction_valid: false,
  last_checked_at: new Date().toISOString()
};

const baseOpenDart: OpenDartNormalized = {
  is_listed: true,
  last_checked_at: new Date().toISOString()
};

describe("runScoring", () => {
  it("returns low risk for basic supplier", () => {
    const result = runScoring({
      vendor: baseVendor,
      nts: baseNts,
      g2b: baseG2b,
      openDart: baseOpenDart
    });

    expect(result.grade).toBe("Low");
    expect(result.recommendation).toBe("Go");
  });

  it("flags closed NTS status as red flag", () => {
    const result = runScoring({
      vendor: baseVendor,
      nts: { ...baseNts, status: "closed" },
      g2b: baseG2b,
      openDart: baseOpenDart
    });

    expect(result.redFlags.some((flag) => flag.code === "NTS_CLOSED")).toBe(true);
    expect(result.recommendation).toBe("No-Go");
  });

  it("handles G2B sanction valid", () => {
    const result = runScoring({
      vendor: { ...baseVendor, public_procurement_related: true },
      nts: baseNts,
      g2b: { ...baseG2b, sanction_valid: true },
      openDart: baseOpenDart
    });

    expect(result.redFlags.some((flag) => flag.code === "G2B_SANCTION")).toBe(true);
    expect(result.recommendation).toBe("No-Go");
  });

  it("raises score for high PII and IT vendor", () => {
    const result = runScoring({
      vendor: {
        ...baseVendor,
        vendor_type: "IT",
        pii_access_level: "high",
        expected_annual_spend: 250_000_000
      },
      nts: baseNts,
      g2b: baseG2b,
      openDart: baseOpenDart
    });

    expect(result.grade).toBe("High");
    expect(result.recommendation).toBe("Conditional Go");
  });

  it("adds information gap points for unknown sources", () => {
    const result = runScoring({
      vendor: { ...baseVendor, public_procurement_related: true },
      nts: { ...baseNts, status: "unknown" },
      g2b: { ...baseG2b, has_sanction: "unknown", sanction_valid: "unknown" },
      openDart: { ...baseOpenDart, is_listed: "not_applicable" }
    });

    expect(result.scoreTotal).toBeGreaterThan(20);
  });

  it("sets medium grade with advance payment and spend", () => {
    const result = runScoring({
      vendor: {
        ...baseVendor,
        advance_payment: true,
        expected_annual_spend: 80_000_000
      },
      nts: baseNts,
      g2b: baseG2b,
      openDart: baseOpenDart
    });

    expect(["Medium", "High"]).toContain(result.grade);
    expect(result.recommendedActions.length).toBeGreaterThan(0);
  });
});
