import type { Metadata } from "next";
import type { Viewport } from "next";
import "./globals.css";
import AuthGate from "@/components/AuthGate";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: "火花脑机",
  description: "青少年专注力训练与课程交付",
  metadataBase: new URL("https://huohuabrain.top"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-dvh overflow-y-scroll">
        <div className="relative min-h-dvh bg-[#060B19] text-white">
          <UserProvider>
            <AuthGate>{children}</AuthGate>
          </UserProvider>
        </div>
      </body>
    </html>
  );
}
