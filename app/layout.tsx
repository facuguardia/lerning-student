import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.facuguardia.dev"),
  title: {
    default: "Vibe Learning",
    template: "Vibe Learning - %s",
  },
  description: "Sistema de Gestión de Aprendizaje moderno y eficiente",
  applicationName: "Vibe Learning",
  keywords: [
    "Vibe Learning",
    "Facu Guardia",
    "Sistema de aprendizaje",
    "Cursos",
    "Módulos",
    "Quizzes",
    "Proyectos",
    "Educación",
  ],
  authors: [{ name: "Facu Guardia", url: "https://www.facuguardia.dev" }],
  creator: "Facu Guardia",
  publisher: "Facu Guardia",
  category: "education",
  alternates: {
    canonical: "https://www.facuguardia.dev/",
  },
  openGraph: {
    type: "website",
    url: "https://www.facuguardia.dev/",
    title: "Vibe Learning — Facu Guardia",
    description: "Sistema de Gestión de Aprendizaje moderno y eficiente",
    siteName: "Vibe Learning",
    locale: "es_AR",
    images: [
      {
        url: "/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "Vibe Learning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Learning — Facu Guardia",
    description: "Sistema de Gestión de Aprendizaje moderno y eficiente",
    images: ["/placeholder.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
