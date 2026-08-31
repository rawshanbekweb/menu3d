import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Menu3D",
  description: "QR orqali ochiladigan 3D/AR restoran menyusi",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
