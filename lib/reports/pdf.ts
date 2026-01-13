import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Vendor } from "@prisma/client";
import type { RecommendationResult } from "@/lib/scoring/types";

export async function generateMemoPdf(params: {
  vendor: Vendor;
  screeningSummary: RecommendationResult;
  runAt: Date;
}): Promise<Uint8Array> {
  const { vendor, screeningSummary, runAt } = params;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const title = "거래처 심사 결과(권고)";
  page.drawText(title, {
    x: 50,
    y: 800,
    size: 18,
    font,
    color: rgb(0.1, 0.1, 0.1)
  });

  const lines = [
    `1) 목적/범위: ${vendor.vendor_name} 신규/정기 심사 결과 요약`,
    "2) 자동 조회 결과 요약:",
    `   - 종합 점수: ${screeningSummary.scoreTotal}점`,
    `   - 리스크 등급: ${screeningSummary.grade}`,
    `   - 권고: ${screeningSummary.recommendation}`,
    "3) 리스크 등급 및 근거:",
    `   - 레드플래그: ${
      screeningSummary.redFlags.length
        ? screeningSummary.redFlags.map((flag) => flag.description).join(", ")
        : "없음"
    }`,
    "4) 권고 조치:",
    ...screeningSummary.recommendedActions.map((action) => `   - ${action}`),
    "5) 한계 및 면책:",
    "   - 본 문서는 권고이며 승인/보증이 아님",
    "   - 조회 시점 및 데이터 공백 가능",
    `   - 조회 일시: ${runAt.toISOString()}`
  ];

  let y = 760;
  for (const line of lines) {
    page.drawText(line, {
      x: 50,
      y,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.2)
    });
    y -= 18;
    if (y < 80) break;
  }

  return pdfDoc.save();
}
