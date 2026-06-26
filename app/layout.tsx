import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Isra&Liz · Nos casamos",
  description: "Invitacion de boda de Isra&Liz · 20 de febrero de 2027 · Uruapan, Michoacan.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title: "Isra&Liz · Nos casamos",
    description: "20 de febrero de 2027 · Salon Presidente · Uruapan, Michoacan.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2eee7",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
