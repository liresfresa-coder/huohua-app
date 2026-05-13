"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  CalendarCheck2,
  Brain,
  ArrowRight,
  Clock,
  Headset,
  Medal,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseClient } from "@/src/lib/supabase";
import { useUser } from "@/context/UserContext";

type FocusSessionRow = {
  duration: number | null;
  duration_minutes?: number | null;
  created_at: string;
};

type CourseDbRow = Record<string, unknown>;

function pickString(row: CourseDbRow, keys: string[]) {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

function pickId(row: CourseDbRow) {
  const direct = row.id ?? row.course_id ?? row.courseId ?? row.uuid ?? row._id;
  if (typeof direct === "string" && direct.trim()) return direct;
  if (typeof direct === "number" && Number.isFinite(direct)) return String(direct);
  return "";
}

function getGreeting(hour: number) {
  if (hour >= 5 && hour <= 11) return "早上好";
  if (hour >= 12 && hour <= 17) return "下午好";
  return "晚上好";
}

function getBeijingYmd(date: Date) {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
  };
}

function formatBeijingMd(date: Date) {
  const p = getBeijingYmd(date);
  return `${p.month}月${p.day}日`;
}

function getBeijingTodayRangeUtcIso(now: Date) {
  const p = getBeijingYmd(now);
  const startUtcMs = Date.UTC(p.year, p.month - 1, p.day) - 8 * 3600 * 1000;
  const endUtcMs = startUtcMs + 24 * 3600 * 1000;
  return {
    startIso: new Date(startUtcMs).toISOString(),
    endIso: new Date(endUtcMs).toISOString(),
  };
}

export default function Home() {
  const router = useRouter();
  const supportTapGuardRef = useRef(0);
  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);

  const { nickname } = useUser();
  const [greeting, setGreeting] = useState(() => getGreeting(new Date().getHours()));
  const [beijingDate, setBeijingDate] = useState(() => formatBeijingMd(new Date()));
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [todayLoading, setTodayLoading] = useState(true);
  const [featured, setFeatured] = useState<{
    id: string;
    title: string;
    subtitle: string;
  } | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
    setBeijingDate(formatBeijingMd(new Date()));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase) return;
      const sb = supabase;
      try {
        const { data: userData } = await sb.auth.getUser();
        if (cancelled) return;

        const userId = userData.user?.id ?? null;

        const { startIso, endIso } = getBeijingTodayRangeUtcIso(new Date());
        const isMissing = (message: string, key: string) => {
          const msg = (message || "").toLowerCase();
          const k = key.toLowerCase();
          return msg.includes(k) && (msg.includes("does not exist") || msg.includes("schema cache"));
        };

        setTodayLoading(true);

        async function tryLoadFocus(
          table: "focus_session" | "focus_sessions",
          column: "duration" | "duration_minutes",
        ) {
          let q = sb.from(table).select(`${column}, created_at`).gte("created_at", startIso).lt("created_at", endIso);
          if (userId) {
            const withUser = await q.eq("user_id", userId);
            if (!withUser.error) return withUser;
            if (isMissing(withUser.error.message ?? "", "user_id")) {
              return await sb.from(table).select(`${column}, created_at`).gte("created_at", startIso).lt("created_at", endIso);
            }
            return withUser;
          }
          return await q;
        }

        const focusAttempts = [
          () => tryLoadFocus("focus_session", "duration"),
          () => tryLoadFocus("focus_session", "duration_minutes"),
          () => tryLoadFocus("focus_sessions", "duration_minutes"),
          () => tryLoadFocus("focus_sessions", "duration"),
        ];

        let focusRows: FocusSessionRow[] = [];
        for (const fn of focusAttempts) {
          const { data, error } = await fn();
          if (!error) {
            focusRows = (data ?? []) as unknown as FocusSessionRow[];
            break;
          }
          const msg = error.message ?? "";
          if (msg.toLowerCase().includes("schema cache") || msg.toLowerCase().includes("does not exist")) {
            continue;
          }
        }

        if (cancelled) return;
        const minutes = focusRows
          .map((r) => Number(r.duration ?? r.duration_minutes ?? 0))
          .filter((n) => Number.isFinite(n) && n > 0)
          .reduce((acc, n) => acc + n, 0);
        setTodayMinutes(minutes);
        setTodayLoading(false);

        setFeaturedLoading(true);
        const orderAttempts: Array<{
          column: string;
          ascending: boolean;
        }> = [
          { column: "sort_order", ascending: false },
          { column: "created_at", ascending: false },
        ];

        let featuredRow: CourseDbRow | null = null;
        for (const ord of orderAttempts) {
          const attempt = await sb
            .from("course")
            .select("*")
            .eq("is_published", true)
            .order(ord.column, { ascending: ord.ascending })
            .limit(3);
          if (!attempt.error) {
            const rows = (attempt.data ?? []) as unknown as CourseDbRow[];
            featuredRow = rows[0] ?? null;
            break;
          }
          if (isMissing(attempt.error.message ?? "", ord.column)) continue;
          if (isMissing(attempt.error.message ?? "", "is_published")) break;
          break;
        }

        if (!featuredRow) {
          const fallback = await sb.from("course").select("*").limit(3);
          if (!fallback.error) {
            const rows = (fallback.data ?? []) as unknown as CourseDbRow[];
            featuredRow = rows[0] ?? null;
          }
        }

        if (cancelled) return;
        if (featuredRow) {
          const id = pickId(featuredRow);
          const title = pickString(featuredRow, ["title", "name", "course_title", "course_name", "courseName"]) || "专注力提升课";
          const subtitle =
            pickString(featuredRow, ["description", "summary", "intro", "brief", "subtitle"]) || "科学训练 × 高效专注";
          if (id) {
            setFeatured({ id, title, subtitle });
          }
        }
        setFeaturedLoading(false);
      } catch {
        if (cancelled) return;
        setTodayLoading(false);
        setFeaturedLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  function fireSupportAlert(message: string) {
    const now = Date.now();
    if (now - supportTapGuardRef.current < 650) return;
    supportTapGuardRef.current = now;
    window.alert(message);
  }

  return (
    <main className="flex-1 pt-6 pb-32">
      <header>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <span className="grid h-8 w-8 place-items-center rounded-2xl bg-white/5 backdrop-blur-md">
              <Brain className="h-5 w-5 text-blue-400 drop-shadow-[0_0_18px_rgba(59,130,246,0.55)]" />
            </span>
            火花脑机
          </div>
          <button className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white/5 backdrop-blur-md">
            <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.85)]" />
            <Bell className="h-5 w-5 text-white/70" />
          </button>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-white">
              {greeting}，{nickname} <span className="inline-block align-top">👋</span>
            </h1>
            <div className="mt-1 text-xs text-slate-400">
              专注当下，持续进步 ✨
            </div>
          </div>
          <div className="shrink-0 pb-0.5 text-xs font-light text-slate-400">
            {beijingDate}
          </div>
        </div>
      </header>

      <section className="mt-5">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F1E4A]/90 to-[#050A15]/90 border border-[#3B82F6]/40 shadow-[0_0_30px_rgba(37,99,235,0.15)] rounded-3xl p-5">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>

          <div className="relative pr-40">
            <div className="text-xs font-semibold text-white/70">今日推荐</div>
            <div className="mt-2 text-[28px] font-semibold leading-[1.05] tracking-tight text-white">
              {featuredLoading ? "专注力提升课" : featured?.title || "专注力提升课"}
            </div>
            <div className="mt-2 text-xs font-light text-slate-300/80">
              {featuredLoading ? "科学训练 × 高效专注" : featured?.subtitle || "科学训练 × 高效专注"}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300">
                <Sparkles className="h-3 w-3 text-slate-300/80" />
                初级
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300">
                <Clock className="h-3 w-3 text-slate-300/80" />
                15分钟
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300">
                <BookOpen className="h-3 w-3 text-slate-300/80" />
                互动课程
              </span>
            </div>

            <Link
              href={featured?.id ? `/courses/${featured.id}` : "/courses/focus-1"}
              className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white font-medium text-sm px-6 py-2.5 rounded-full flex items-center gap-1 shadow-lg shadow-blue-500/30 w-max mt-5"
            >
              立即学习 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 flex items-center justify-center pointer-events-none">
            <div className="absolute w-32 h-32 border-[0.5px] border-blue-400/30 rounded-full"></div>
            <div className="absolute w-40 h-16 border-[0.5px] border-blue-400/30 rounded-[100%] -rotate-12"></div>
            <div className="absolute bottom-8 right-8 w-32 h-6 bg-blue-500/40 blur-md rounded-[100%]"></div>
            <div className="absolute bottom-8 right-12 w-24 h-4 border border-blue-400/50 rounded-[100%]"></div>
            <div className="absolute w-16 h-16 bg-blue-600/40 blur-xl rounded-full"></div>
            <Brain
              size={80}
              strokeWidth={1}
              className="text-[#00C6FF] drop-shadow-[0_0_8px_rgba(0,198,255,0.8)]"
            />
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <Link
          href="/training"
          className="rounded-2xl border border-white/5 bg-[#11192C]/80 p-3.5 backdrop-blur-md"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <Target className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">今日训练</div>
              <div className="mt-1 text-xs font-light text-slate-400">
                {todayLoading
                  ? "加载中..."
                  : todayMinutes > 0
                    ? `今日已专注 ${todayMinutes} 分钟`
                    : "今日尚未开启训练"}
              </div>
            </div>
          </div>
          <div className="bg-transparent border border-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 w-max mt-2">
            开始训练 <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <Link
          href="/courses"
          className="rounded-2xl border border-white/5 bg-[#11192C]/80 p-3.5 backdrop-blur-md"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">我的课程</div>
              <div className="mt-1 text-xs font-light text-slate-400">
                继续上次学习进度
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs font-light text-slate-400">
              <span />
              <span>60%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-slate-700">
              <div className="h-1 w-[60%] rounded-full bg-blue-500" />
            </div>
          </div>

          <div className="bg-transparent border border-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 w-max mt-2">
            继续学习 <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <button
          type="button"
          onClick={() => router.push("/training")}
          className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#11192C]/80 p-3.5 text-left backdrop-blur-md cursor-pointer hover:opacity-80 active:scale-95 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">今日打卡</div>
              <div className="mt-1 text-xs font-light text-slate-400">
                连续 6 天
              </div>
            </div>
          </div>
          <div className="bg-transparent border border-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 w-max mt-2">
            去打卡 <ArrowRight className="h-3.5 w-3.5" />
          </div>
          <ShieldCheck
            size={40}
            className="pointer-events-none absolute bottom-2 right-2 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]"
          />
        </button>

        <button
          type="button"
          onClick={() => router.push("/records")}
          className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#11192C]/80 p-3.5 text-left backdrop-blur-md cursor-pointer hover:opacity-80 active:scale-95 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">成长成就</div>
              <div className="mt-1 text-xs font-light text-slate-400">
                本周 3 枚勋章
              </div>
            </div>
          </div>
          <div className="bg-transparent border border-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 w-max mt-2">
            查看成就 <ArrowRight className="h-3.5 w-3.5" />
          </div>
          <div className="pointer-events-none absolute bottom-2 right-2 flex -space-x-3">
            <Medal size={32} className="text-amber-600 drop-shadow-md z-0" />
            <Medal size={32} className="text-slate-200 drop-shadow-md z-10" />
            <Medal size={32} className="text-yellow-400 drop-shadow-md z-20" />
          </div>
        </button>
      </section>

      <section className="mt-4 rounded-2xl bg-white/[0.02] p-4">
        <div className="text-sm font-semibold text-white">老师与支持</div>
        <div className="mt-1 text-xs font-light text-slate-400">
          有问题？我们随时为你和家长提供帮助
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => fireSupportAlert("请添加专属班主任微信：Teacher_001")}
            onPointerUp={() => fireSupportAlert("请添加专属班主任微信：Teacher_001")}
            onTouchEnd={() => fireSupportAlert("请添加专属班主任微信：Teacher_001")}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white/[0.02] p-3 cursor-pointer hover:bg-slate-800/50 active:scale-95 transition-all"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-500/15">
              <User className="h-5 w-5 text-[#00C6FF]" />
            </span>
            <span className="text-xs font-medium text-white/80">联系老师</span>
          </button>
          <button
            type="button"
            onClick={() => fireSupportAlert("请添加小助手微信获取入群链接：Assistant_001")}
            onPointerUp={() => fireSupportAlert("请添加小助手微信获取入群链接：Assistant_001")}
            onTouchEnd={() => fireSupportAlert("请添加小助手微信获取入群链接：Assistant_001")}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white/[0.02] p-3 cursor-pointer hover:bg-slate-800/50 active:scale-95 transition-all"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-500/15">
              <Users className="h-5 w-5 text-[#00C6FF]" />
            </span>
            <span className="text-xs font-medium text-white/80">加入学习群</span>
          </button>
          <button
            type="button"
            onClick={() => fireSupportAlert("请添加专属顾问微信：Consultant_001")}
            onPointerUp={() => fireSupportAlert("请添加专属顾问微信：Consultant_001")}
            onTouchEnd={() => fireSupportAlert("请添加专属顾问微信：Consultant_001")}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white/[0.02] p-3 cursor-pointer hover:bg-slate-800/50 active:scale-95 transition-all"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-500/15">
              <Headset className="h-5 w-5 text-[#00C6FF]" />
            </span>
            <span className="text-xs font-medium text-white/80">联系顾问</span>
          </button>
        </div>
      </section>
    </main>
  );
}
