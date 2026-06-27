import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Markdown Editor",
  description: "실시간 프리뷰 마크다운 에디터",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/*
          react-grab — 개발 디버깅 도구(요소 hover → ⌘C/Ctrl+C로 컨텍스트 복사).
          NODE_ENV === "development"에서만 로드 → 프로덕션 번들·HTML에 미포함.
          CDN(unpkg) 방식이라 의존성 설치 없이 dev에서만 주입된다.
        */}
        {process.env.NODE_ENV === "development" && (
          <Script
            src="https://unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
