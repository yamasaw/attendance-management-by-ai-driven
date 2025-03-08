import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "勤怠管理システム",
  description: "写真撮影による勤怠管理システム",
};

export const runtime = "edge";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-acrylic border-b border-gray-200 py-2 px-4 shadow-sm z-10">
            <div className="container mx-auto">
              <h1 className="text-headline text-primary">勤怠管理システム</h1>
            </div>
          </header>
          <main className="flex-grow container mx-auto p-4">
            {children}
          </main>
          <footer className="bg-gray-dark text-white py-2 px-4">
            <div className="container mx-auto text-center text-small">
              © {new Date().getFullYear()} 勤怠管理システム
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
} 