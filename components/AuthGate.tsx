"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import Login from "@/components/Login";
import { getSupabaseClient } from "@/src/lib/supabase";
import { useUser } from "@/context/UserContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { setIdentityEmail, updateUserInfo, resetUserInfo } = useUser();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setSession(null);
      return;
    }

    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        setSession(data.session ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setSession(null);
        setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (loading) return;
    if (!pathname) return;

    if (!session && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    if (session && pathname === "/login") {
      router.replace("/");
    }
  }, [loading, pathname, router, session]);

  useEffect(() => {
    if (loading) return;
    if (!session?.user) {
      resetUserInfo();
      return;
    }
    const email = session.user.email ?? null;
    if (!email) return;
    setIdentityEmail(email);
    const metaNick = (session.user.user_metadata as Record<string, unknown> | null)?.nickname;
    const metaAvatar = (session.user.user_metadata as Record<string, unknown> | null)?.avatar;
    const storedNick = (() => {
      try {
        const v = localStorage.getItem(`nickname_${email}`);
        return typeof v === "string" && v.trim() ? v.trim() : "";
      } catch {
        return "";
      }
    })();
    const storedAvatar = (() => {
      try {
        const v = localStorage.getItem(`avatar_${email}`);
        return typeof v === "string" && v.trim() ? v : null;
      } catch {
        return null;
      }
    })();
    const nickname =
      typeof metaNick === "string" && metaNick.trim()
        ? metaNick.trim()
        : storedNick
          ? storedNick
          : (email.split("@")[0] || "探索者").trim() || "探索者";
    const avatar =
      typeof metaAvatar === "string" && metaAvatar.trim()
        ? metaAvatar
        : storedAvatar;
    updateUserInfo(nickname, avatar);
  }, [loading, resetUserInfo, session, setIdentityEmail, updateUserInfo]);

  if (loading) {
    return null;
  }

  if (!session) {
    return <Login />;
  }

  if (pathname === "/login") {
    return null;
  }

  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {isAdminRoute ? (
        <div className="min-h-dvh w-full">{children}</div>
      ) : (
        <>
          <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-hidden px-4 pb-32">
            {children}
          </div>
          <BottomNavigation />
        </>
      )}
    </>
  );
}
