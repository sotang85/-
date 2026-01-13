import { prisma } from "@/lib/db";
import { generateMemoPdf } from "@/lib/reports/pdf";
import { runScoring } from "@/lib/scoring/scoring";
import { safeJsonParse } from "@/lib/utils/json";
import type { G2bNormalized, NtsNormalized, OpenDartNormalized } from "@/lib/providers/types";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const screening = await prisma.screeningRun.findUnique({
    where: { id: params.id },
    include: { vendor: true, evidence_snapshots: true }
  });

  if (!screening) {
    return new Response("Not found", { status: 404 });
  }

  const findSnapshot = (provider: string) =>
    screening.evidence_snapshots.find((snapshot) => snapshot.provider_name === provider);

  const nts = safeJsonParse(findSnapshot("NTS")?.normalized_json ?? "", {
    status: "unknown",
    last_checked_at: screening.run_at.toISOString()
  } as NtsNormalized);

  const openDart = safeJsonParse(findSnapshot("OpenDART")?.normalized_json ?? "", {
    is_listed: "not_applicable",
    last_checked_at: screening.run_at.toISOString()
  } as OpenDartNormalized);

  const g2b = safeJsonParse(findSnapshot("G2B")?.normalized_json ?? "", {
    has_sanction: "unknown",
    sanction_valid: "unknown",
    last_checked_at: screening.run_at.toISOString()
  } as G2bNormalized);

  const scoring = runScoring({
    vendor: screening.vendor,
    nts,
    g2b,
    openDart
  });

  const pdfBytes = await generateMemoPdf({
    vendor: screening.vendor,
    screeningSummary: scoring,
    runAt: screening.run_at
  });

  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="memo-${screening.id}.pdf"`
    }
  });
}
