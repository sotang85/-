import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { runScreeningAction } from "@/app/vendors/actions";

function recommendationLabel(value: string) {
  if (value === "NoGo") return "No-Go";
  if (value === "ConditionalGo") return "조건부 Go";
  return value;
}

function gradeLabel(value: string) {
  if (value === "High") return "높음";
  if (value === "Medium") return "중간";
  return "낮음";
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
          <p className="text-sm text-slate-600">사업자등록번호: {vendor.biz_reg_no}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/vendors">뒤로</Link>
          </Button>
          <form action={runScreeningAction}>
            <input type="hidden" name="vendorId" value={vendor.id} />
            <Button type="submit">심사 실행</Button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">기본 정보</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">거래처 유형</dt>
              <dd>{vendor.vendor_type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">예상 연간 지출</dt>
              <dd>{vendor.expected_annual_spend?.toLocaleString() ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">선급금</dt>
              <dd>{vendor.advance_payment ? "예" : "아니오"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">개인정보 접근</dt>
              <dd>{vendor.pii_access_level}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">공공조달</dt>
              <dd>{vendor.public_procurement_related ? "예" : "아니오"}</dd>
            </div>
            {vendor.notes ? (
              <div>
                <dt className="text-slate-500">메모</dt>
                <dd>{vendor.notes}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">최근 심사 결과</h3>
          {latest ? (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>등급</span>
                <Badge>{gradeLabel(latest.overall_grade)}</Badge>
              </div>
              <p>권고: {recommendationLabel(latest.recommendation)}</p>
              <p>총점: {latest.score_total}</p>
              <p>실행 시각: {latest.run_at.toISOString()}</p>
              <p>다음 심사일: {latest.next_review_at.toISOString().slice(0, 10)}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" asChild>
                  <Link href={`/api/screenings/${latest.id}/evidence`}>
                    증거팩 JSON 다운로드
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/api/screenings/${latest.id}/memo`}>
                    PDF 메모 다운로드
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">아직 심사 내역이 없습니다.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold">심사 이력</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>실행일</TableHead>
              <TableHead>등급</TableHead>
              <TableHead>권고</TableHead>
              <TableHead>점수</TableHead>
              <TableHead>보기</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendor.screenings.map((run) => (
              <TableRow key={run.id}>
                <TableCell>{run.run_at.toISOString().slice(0, 10)}</TableCell>
                <TableCell>{gradeLabel(run.overall_grade)}</TableCell>
                <TableCell>{recommendationLabel(run.recommendation)}</TableCell>
                <TableCell>{run.score_total}</TableCell>
                <TableCell>
                  <Button variant="outline" asChild>
                    <Link href={`/screenings/${run.id}`}>상세</Link>
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
