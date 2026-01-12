import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { runScreeningAction } from "@/app/vendors/actions";

function recommendationLabel(value: string) {
  if (value === "NoGo") return "No-Go";
  if (value === "ConditionalGo") return "Conditional Go";
  return value;
}

export default async function VendorDetailPage({
  params
}: {
  params: { id: string };
}) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: params.id },
    include: {
      screenings: {
        orderBy: { run_at: "desc" }
      }
    }
  });

  if (!vendor) return notFound();

  const latest = vendor.screenings[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{vendor.vendor_name}</h2>
          <p className="text-sm text-slate-600">BizRegNo: {vendor.biz_reg_no}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/vendors">Back</Link>
          </Button>
          <form action={async () => runScreeningAction(vendor.id)}>
            <Button type="submit">Run screening</Button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">Profile</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Vendor type</dt>
              <dd>{vendor.vendor_type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Expected annual spend</dt>
              <dd>{vendor.expected_annual_spend?.toLocaleString() ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Advance payment</dt>
              <dd>{vendor.advance_payment ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">PII access</dt>
              <dd>{vendor.pii_access_level}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Public procurement</dt>
              <dd>{vendor.public_procurement_related ? "Yes" : "No"}</dd>
            </div>
            {vendor.notes ? (
              <div>
                <dt className="text-slate-500">Notes</dt>
                <dd>{vendor.notes}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">Latest decision</h3>
          {latest ? (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>Grade</span>
                <Badge>{latest.overall_grade}</Badge>
              </div>
              <p>Recommendation: {recommendationLabel(latest.recommendation)}</p>
              <p>Score total: {latest.score_total}</p>
              <p>Run at: {latest.run_at.toISOString()}</p>
              <p>Next review: {latest.next_review_at.toISOString().slice(0, 10)}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" asChild>
                  <Link href={`/api/screenings/${latest.id}/evidence`}>
                    Download Evidence JSON
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/api/screenings/${latest.id}/memo`}>
                    Download PDF Memo
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">No screening yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold">Screening history</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run date</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Recommendation</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendor.screenings.map((run) => (
              <TableRow key={run.id}>
                <TableCell>{run.run_at.toISOString().slice(0, 10)}</TableCell>
                <TableCell>{run.overall_grade}</TableCell>
                <TableCell>{recommendationLabel(run.recommendation)}</TableCell>
                <TableCell>{run.score_total}</TableCell>
                <TableCell>
                  <Button variant="outline" asChild>
                    <Link href={`/screenings/${run.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
