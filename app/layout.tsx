import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AdhikarPath – Enterprise Access Management Portal",
    template: "%s | AdhikarPath",
  },
  description:
    "AdhikarPath is an enterprise-grade Identity & Access Management portal for managing user access, roles, and authorisations across business systems.",
  keywords: ["IAM", "access management", "identity", "enterprise", "adhikarpath"],
  authors: [{ name: "AdhikarPath Team" }],
};

export const viewport: Viewport = {
  themeColor: "#1565C0",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
