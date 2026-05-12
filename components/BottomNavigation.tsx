"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Home, Target, User } from "lucide-react";

const tabs = [
  { label: "首页", href: "/", Icon: Home },
  { label: "课程", href: "/courses", Icon: BookOpen },
  { label: "训练", href: "/training", Icon: Target },
  { label: "记录", href: "/records", Icon: BarChart3 },
  { label: "我的", href: "/profile", Icon: User },
] as const;

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-6 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-md bg-[#0A1128]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-6 py-4 flex justify-between items-center z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
      aria-label="底部导航"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.Icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-1 flex-col items-center justify-center"
          >
            <Icon
              className={[
                "h-6 w-6 transition-colors",
                isActive ? "text-[#00C6FF]" : "text-white/55",
              ].join(" ")}
            />
            {isActive ? (
              <span className="mt-1 h-1 w-4 rounded-full bg-[#00C6FF] shadow-[0_0_10px_rgba(0,198,255,0.55)]" />
            ) : (
              <span className="mt-1 h-1 w-4 opacity-0" />
            )}
            <span
              className={[
                "mt-1 text-[11px] font-medium transition-colors",
                isActive ? "text-[#00C6FF]" : "text-white/55",
              ].join(" ")}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
