import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
