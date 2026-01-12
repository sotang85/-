import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { runScreeningAction } from "@/app/vendors/actions";

function gradeBadge(grade?: string | null) {
  if (!grade) return <Badge variant="outline">Not screened</Badge>;
  if (grade === "High") return <Badge variant="danger">High</Badge>;
  if (grade === "Medium") return <Badge variant="warning">Medium</Badge>;
  return <Badge variant="success">Low</Badge>;
}

function recommendationLabel(value?: string | null) {
  if (!value) return "Pending";
  if (value === "NoGo") return "No-Go";
  if (value === "ConditionalGo") return "Conditional Go";
  return value;
}

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { created_at: "desc" },
    include: {
      screenings: {
        orderBy: { run_at: "desc" },
        take: 1
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Vendors</h2>
          <p className="text-sm text-slate-600">Manage vendor onboarding and screening runs.</p>
        </div>
        <Button asChild>
          <Link href="/vendors/new">New Vendor</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor</TableHead>
            <TableHead>BizRegNo</TableHead>
            <TableHead>Risk Grade</TableHead>
            <TableHead>Last Screened</TableHead>
            <TableHead>Next Review</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => {
            const latest = vendor.screenings[0];
            return (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">{vendor.vendor_name}</TableCell>
                <TableCell>{vendor.biz_reg_no}</TableCell>
                <TableCell>{gradeBadge(latest?.overall_grade)}</TableCell>
                <TableCell>{latest?.run_at.toISOString().slice(0, 10) ?? "-"}</TableCell>
                <TableCell>{latest?.next_review_at.toISOString().slice(0, 10) ?? "-"}</TableCell>
                <TableCell>{recommendationLabel(latest?.recommendation)}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" asChild>
                    <Link href={`/vendors/${vendor.id}`}>View</Link>
                  </Button>
                  <form action={async () => runScreeningAction(vendor.id)} className="inline">
                    <Button type="submit">Run screening</Button>
                  </form>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
