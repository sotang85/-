"use server";

import { revalidatePath } from "next/cache";
import { runScreening } from "@/lib/screening/run";

export async function runScreeningAction(formData: FormData) {
  const vendorId = String(formData.get("vendorId") ?? "");
  if (!vendorId) {
    throw new Error("vendorId is required");
  }
  await runScreening(vendorId, "local-user");
  revalidatePath("/vendors");
  revalidatePath(`/vendors/${vendorId}`);
}
