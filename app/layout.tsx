import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vendor Risk Screening",
  description: "거래처 온보딩 및 정기 심사 자동화"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <header className="mb-8">
            <h1 className="text-2xl font-semibold">Vendor Risk Screening</h1>
            <p className="text-sm text-slate-600">
              한국 거래처 온보딩 및 정기 심사를 자동화합니다.
            </p>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
