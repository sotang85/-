import { prisma } from "@/lib/db";
import { buildEvidencePack } from "@/lib/reports/evidence";

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

  const pack = buildEvidencePack({
    vendor: screening.vendor,
    screening,
    snapshots: screening.evidence_snapshots
  });

  return Response.json(pack, {
    headers: {
      "Content-Disposition": `attachment; filename="evidence-${screening.id}.json"`
    }
  });
}
