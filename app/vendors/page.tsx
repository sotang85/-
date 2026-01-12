import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { runScreeningAction } from "@/app/vendors/actions";

function gradeLabel(grade?: string | null) {
  if (grade === "High") return "높음";
  if (grade === "Medium") return "중간";
  if (grade === "Low") return "낮음";
  return "미심사";
}

function gradeBadge(grade?: string | null) {
  if (!grade) return <Badge variant="outline">미심사</Badge>;
  if (grade === "High") return <Badge variant="danger">{gradeLabel(grade)}</Badge>;
  if (grade === "Medium") return <Badge variant="warning">{gradeLabel(grade)}</Badge>;
  return <Badge variant="success">{gradeLabel(grade)}</Badge>;
}

function recommendationLabel(value?: string | null) {
  if (!value) return "대기";
  if (value === "NoGo") return "No-Go";
  if (value === "ConditionalGo") return "조건부 Go";
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
          <h2 className="text-xl font-semibold">거래처 목록</h2>
          <p className="text-sm text-slate-600">거래처 온보딩 및 심사 실행을 관리합니다.</p>
        </div>
        <Button asChild>
          <Link href="/vendors/new">신규 거래처</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>거래처</TableHead>
            <TableHead>사업자등록번호</TableHead>
            <TableHead>리스크 등급</TableHead>
            <TableHead>최종 심사일</TableHead>
            <TableHead>다음 심사일</TableHead>
            <TableHead>권고 상태</TableHead>
            <TableHead>작업</TableHead>
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
                    <Link href={`/vendors/${vendor.id}`}>상세</Link>
                  </Button>
                  <form action={async () => runScreeningAction(vendor.id)} className="inline">
                    <Button type="submit">심사 실행</Button>
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
