"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/src/lib/supabase";

type FocusSessionRow = {
  id: string;
  created_at: string;
  duration_minutes?: number | null;
  task_name?: string | null;
};

function getBeijingYmd(date: Date) {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { year: Number(get("year")), month: Number(get("month")), day: Number(get("day")) };
}

function getBeijingTodayRangeUtcIso(now: Date) {
  const p = getBeijingYmd(now);
  const startUtcMs = Date.UTC(p.year, p.month - 1, p.day) - 8 * 3600 * 1000;
  const endUtcMs = startUtcMs + 24 * 3600 * 1000;
  return { startIso: new Date(startUtcMs).toISOString(), endIso: new Date(endUtcMs).toISOString() };
}

function formatBeijingDateTime(iso: string) {
  const raw = new Date(iso).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = raw.match(/\d+/g) ?? [];
  const month = (parts[0] ?? "").padStart(2, "0");
  const day = (parts[1] ?? "").padStart(2, "0");
  const hour = (parts[2] ?? "").padStart(2, "0");
  const minute = (parts[3] ?? "").padStart(2, "0");
  return `${month}月${day}日 ${hour}:${minute}`;
}

export default function RecordsPage() {
  const mockWeek = useMemo(
    () => [
      { label: "一", value: 12 },
      { label: "二", value: 0 },
      { label: "三", value: 25 },
      { label: "四", value: 18 },
      { label: "五", value: 35 },
      { label: "六", value: 10 },
      { label: "日", value: 28 },
    ],
    [],
  );

  const [todayMinutes, setTodayMinutes] = useState(0);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);
  const [history, setHistory] = useState<FocusSessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase) return;
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (cancelled) return;
      const userId = userData.user?.id;
      if (userError || !userId) {
        setLoading(false);
        return;
      }

      const { startIso, endIso } = getBeijingTodayRangeUtcIso(new Date());
      const { data: todayData, error: todayError } = await supabase
        .from("focus_sessions")
        .select("duration_minutes, created_at")
        .eq("user_id", userId)
        .gte("created_at", startIso)
        .lt("created_at", endIso);

      if (cancelled) return;
      if (todayError) {
        console.error("focus_sessions today load failed", {
          code: todayError.code,
          message: todayError.message,
          details: todayError.details,
          hint: todayError.hint,
        });
      } else {
        const rows = (todayData ?? []) as unknown as Array<{
          duration_minutes: number | null;
          created_at: string;
        }>;
        const minutes = rows
          .map((r) => Number(r.duration_minutes ?? 0))
          .filter((n) => Number.isFinite(n) && n > 0)
          .reduce((acc, n) => acc + n, 0);
        setTodayMinutes(minutes);
        setTodayCheckedIn(rows.length > 0);
      }

      const { data, error } = await supabase
        .from("focus_sessions")
        .select("id, created_at, duration_minutes, task_name")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (cancelled) return;
      if (error) {
        console.error("focus_sessions load failed", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as unknown as FocusSessionRow[];
      setHistory(rows);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const maxValue = Math.max(...mockWeek.map((x) => x.value), 1);

  return (
    <main className="flex-1 pt-6 pb-32 bg-[#020617]">
      <header>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white/90">火花脑机</div>
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.55)]" />
          </div>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          记录
        </h1>
      </header>

      <section className="mt-5">
        <div className="text-sm font-semibold text-white/80">今日成就</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="text-xs text-white/60">今日累计专注时长</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {todayMinutes}
              <span className="ml-1 text-xs font-medium text-white/55">
                分钟
              </span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="text-xs text-white/60">今日是否完成打卡</div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  todayCheckedIn ? "bg-emerald-400" : "bg-white/25",
                ].join(" ")}
              />
              <div
                className={[
                  "text-sm font-semibold",
                  todayCheckedIn ? "text-emerald-300" : "text-white/55",
                ].join(" ")}
              >
                {todayCheckedIn ? "已打卡" : "未打卡"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white/90">专注趋势</div>
          <div className="text-xs text-white/55">本周</div>
        </div>

        <div className="mt-4 grid grid-cols-7 items-end gap-2">
          {mockWeek.map((d) => {
            const h = Math.max(8, Math.round((d.value / maxValue) * 100));
            const isMax = d.value === maxValue;
            return (
              <div key={d.label} className="flex flex-col items-center gap-2">
                <div className="relative h-20 w-full">
                  <div
                    className={[
                      "absolute bottom-0 left-0 right-0 rounded-full",
                      isMax
                        ? "bg-gradient-to-t from-sky-400 to-blue-500 shadow-[0_10px_30px_rgba(56,189,248,0.35)]"
                        : "bg-white/10",
                    ].join(" ")}
                    style={{ height: `${h}%` }}
                  />
                </div>
                <div className="text-[11px] text-white/55">{d.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4">
        <div className="text-sm font-semibold text-white/80">专注历史</div>
        <div className="mt-3 grid gap-3">
          {history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">
                      {item.task_name ?? "深度专注"}
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      {formatBeijingDateTime(item.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-sky-200">
                      {Number(item.duration_minutes ?? 0) || 0}分钟
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-xs text-white/60">
              {loading ? "加载中..." : "暂无记录"}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
