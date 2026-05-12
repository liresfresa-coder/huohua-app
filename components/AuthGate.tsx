"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import Login from "@/components/Login";
import { getSupabaseClient } from "@/src/lib/supabase";

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

  if (loading) {
    return null;
  }

  if (!session) {
    return <Login />;
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
