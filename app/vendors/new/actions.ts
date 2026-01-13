"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { vendorSchema } from "@/lib/validation/vendor";

export async function createVendorAction(formData: FormData) {
  const parsed = vendorSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    throw new Error("Invalid vendor input");
  }

  const vendor = await prisma.vendor.create({
    data: {
      vendor_name: parsed.data.vendor_name,
      biz_reg_no: parsed.data.biz_reg_no,
      vendor_type: parsed.data.vendor_type,
      expected_annual_spend: parsed.data.expected_annual_spend,
      advance_payment: parsed.data.advance_payment ?? false,
      pii_access_level: parsed.data.pii_access_level,
      public_procurement_related: parsed.data.public_procurement_related ?? false,
      notes: parsed.data.notes
    }
  });

  redirect(`/vendors/${vendor.id}`);
}
