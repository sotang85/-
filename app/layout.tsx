import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vendor Risk Screening",
  description: "Vendor onboarding and periodic risk screening"
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
              Automated screening for Korea vendor onboarding and periodic review.
            </p>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
