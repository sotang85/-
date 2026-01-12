import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { runScoring } from "@/lib/scoring/scoring";
import type { G2bNormalized, NtsNormalized, OpenDartNormalized } from "@/lib/providers/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

export default async function ScreeningDetailPage({
  params
}: {
  params: { id: string };
}) {
  const screening = await prisma.screeningRun.findUnique({
    where: { id: params.id },
    include: {
      vendor: true,
      evidence_snapshots: true
    }
  });

  if (!screening) return notFound();

  const auditLogs = await prisma.auditLog.findMany({
    where: { entity_id: screening.id },
    orderBy: { at: "desc" }
  });

  const findSnapshot = (provider: string) =>
    screening.evidence_snapshots.find((snapshot) => snapshot.provider_name === provider);

  const nts = (findSnapshot("NTS")?.normalized_json ?? {
    status: "unknown",
    last_checked_at: screening.run_at.toISOString()
  }) as NtsNormalized;

  const openDart = (findSnapshot("OpenDART")?.normalized_json ?? {
    is_listed: "not_applicable",
    last_checked_at: screening.run_at.toISOString()
  }) as OpenDartNormalized;

  const g2b = (findSnapshot("G2B")?.normalized_json ?? {
    has_sanction: "unknown",
    sanction_valid: "unknown",
    last_checked_at: screening.run_at.toISOString()
  }) as G2bNormalized;

  const scoring = runScoring({
    vendor: screening.vendor,
    nts,
    g2b,
    openDart
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">심사 상세</h2>
          <p className="text-sm text-slate-600">{screening.vendor.vendor_name}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/vendors/${screening.vendor_id}`}>거래처로 이동</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">요약</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">총점</dt>
              <dd>{screening.score_total}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">등급</dt>
              <dd>{gradeLabel(screening.overall_grade)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">권고</dt>
              <dd>{recommendationLabel(screening.recommendation)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">실행 시각</dt>
              <dd>{screening.run_at.toISOString()}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">점수 상세</h3>
          <pre className="mt-4 rounded bg-slate-100 p-3 text-xs text-slate-700">
            {JSON.stringify(screening.score_breakdown_json, null, 2)}
          </pre>
          <h4 className="mt-4 font-semibold">레드 플래그</h4>
          <pre className="mt-2 rounded bg-slate-100 p-3 text-xs text-slate-700">
            {JSON.stringify(screening.red_flags_json, null, 2)}
          </pre>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold">정규화된 결과</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>조회 시각</TableHead>
              <TableHead>정규화 결과</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {screening.evidence_snapshots.map((snapshot) => (
              <TableRow key={snapshot.id}>
                <TableCell>{snapshot.provider_name}</TableCell>
                <TableCell>
                  <div className="text-sm">{snapshot.status}</div>
                  {snapshot.message ? (
                    <div className="text-xs text-slate-500">{snapshot.message}</div>
                  ) : null}
                </TableCell>
                <TableCell>{snapshot.checked_at.toISOString()}</TableCell>
                <TableCell>
                  <pre className="rounded bg-slate-100 p-2 text-xs">
                    {JSON.stringify(snapshot.normalized_json, null, 2)}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold">권고 통제/조치</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          {scoring.recommendedActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold">감사 로그</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>행위자</TableHead>
              <TableHead>작업</TableHead>
              <TableHead>시간</TableHead>
              <TableHead>메타데이터</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.actor}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.at.toISOString()}</TableCell>
                <TableCell>
                  <pre className="rounded bg-slate-100 p-2 text-xs">
                    {JSON.stringify(log.metadata_json, null, 2)}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
