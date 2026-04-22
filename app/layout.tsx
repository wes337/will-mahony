import type { Metadata, Viewport } from "next";
import "./globals.css";
import Toast from "./toast";

export const metadata: Metadata = {
  title: "Will Mahony",
  description: " Will Mahony Official Merchandise",
};

export const viewport: Viewport = {
  themeColor: "#ff0000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toast />
      </body>
    </html>
  );
}
