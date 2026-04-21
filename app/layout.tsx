import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Will Mahony",
  description: " Will Mahony Official Merchandise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
