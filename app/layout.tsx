import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Isra&Liz · Nos casamos",
  description: "Invitación de boda de Isra y Liz · 20 de febrero de 2027 · Uruapan, Michoacán.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title: "Isra & Liz · Nos casamos",
    description: "20 de febrero de 2027 · Salón Presidente · Uruapan, Michoacán.",
    type: "website",
    images: [{ url: "/images/gallery/momento-04.jpg", alt: "Isra y Liz juntos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Isra & Liz · Nos casamos",
    images: ["/images/gallery/momento-04.jpg"],
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
