import { z } from "zod";

export const vendorSchema = z.object({
  vendor_name: z.string().min(2),
  biz_reg_no: z.string().regex(/^\d{10}$/),
  vendor_type: z.enum(["supplier", "agency", "logistics", "IT", "other"]),
  expected_annual_spend: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value === undefined || Number.isFinite(value), {
      message: "Expected annual spend must be a number"
    }),
  advance_payment: z
    .string()
    .optional()
    .transform((value) => value === "yes"),
  pii_access_level: z.enum(["none", "limited", "high"]),
  public_procurement_related: z
    .string()
    .optional()
    .transform((value) => value === "yes"),
  notes: z.string().optional()
});

export type VendorInput = z.infer<typeof vendorSchema>;
