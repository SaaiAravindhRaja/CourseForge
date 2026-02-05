import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CourseForge - AI-Powered Course Studio",
  description: "Transform any document into a complete, production-ready course with 6 specialized AI agents. Features gamification, SCORM export, knowledge graphs, and analytics.",
  keywords: ["course creator", "AI", "education", "Gemini", "learning", "e-learning", "LMS", "SCORM"],
  openGraph: {
    title: "CourseForge - AI Course Studio",
    description: "Transform documents into courses with 6 AI agents",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
