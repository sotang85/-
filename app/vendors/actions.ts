"use server";

import { revalidatePath } from "next/cache";
import { runScreening } from "@/lib/screening/run";

export async function runScreeningAction(vendorId: string) {
  await runScreening(vendorId, "local-user");
  revalidatePath("/vendors");
  revalidatePath(`/vendors/${vendorId}`);
}
