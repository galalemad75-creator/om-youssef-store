import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "أم يوسف | Om Youssef Store",
  description: "أفضل الملابس والمفروشات بأسعار الجملة - Best clothing & home goods at wholesale prices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
