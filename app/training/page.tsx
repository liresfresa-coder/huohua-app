"use client";

import {
  ArrowLeft,
  Brain,
  Check,
  CloudRain,
  Leaf,
  Music,
  Pause,
  Play,
  Sparkles,
  Square,
  Star,
  Waves,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/src/lib/supabase";

type FocusSessionRow = {
  duration: number | null;
  duration_minutes?: number | null;
};

export default function TrainingPage() {
  const [selectedDuration, setSelectedDuration] = useState<"5" | "10" | "15" | "25">(
    "15",
  );
  const [activeSound, setActiveSound] = useState<
    "white" | "music" | "rain" | "nature"
  >("white");
  const selectedDurationRef = useRef(selectedDuration);
  const [timeLeft, setTimeLeft] = useState(Number(selectedDuration) * 60);
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [focusCount, setFocusCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const submitGuardRef = useRef(false);
  const isSavingRef = useRef(false);

  useEffect(() => {
    selectedDurationRef.current = selectedDuration;
    submitGuardRef.current = false;
    if (isActive) setIsActive(false);
    setTimeLeft(Number(selectedDuration) * 60);
  }, [selectedDuration]);

  useEffect(() => {
    isSavingRef.current = isSaving;
  }, [isSaving]);

  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!supabase) return;
      const { data, error } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error) {
        console.error("auth getUser failed", error);
        setUserId(null);
        return;
      }
      setUserId(data.user?.id ?? null);
    }

    void loadUser();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    setPoints(totalFocusTime * 10);
  }, [totalFocusTime]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      if (!supabase) return;
      if (!userId) return;
      const sb = supabase;

      const isMissing = (message: string, key: string) => {
        const msg = (message || "").toLowerCase();
        const k = key.toLowerCase();
        return msg.includes(k) && (msg.includes("does not exist") || msg.includes("schema cache"));
      };

      async function tryLoad(
        table: "focus_session" | "focus_sessions",
        column: "duration" | "duration_minutes",
      ) {
        const base = sb.from(table).select(column);
        const withUser = await base.eq("user_id", userId);
        if (!withUser.error) return withUser;
        if (isMissing(withUser.error.message ?? "", "user_id")) {
          return await sb.from(table).select(column);
        }
        return withUser;
      }

      const attempts: Array<Promise<{ data: unknown; error: { message?: string } | null }>> = [
        tryLoad("focus_session", "duration"),
        tryLoad("focus_session", "duration_minutes"),
        tryLoad("focus_sessions", "duration_minutes"),
        tryLoad("focus_sessions", "duration"),
      ];

      let data: unknown = null;
      let error: { message?: string } | null = null;

      for (const p of attempts) {
        const res = await p;
        if (!res.error) {
          data = res.data;
          error = null;
          break;
        }
        error = res.error;
        const msg = res.error.message ?? "";
        if (isMissing(msg, "relation") || msg.toLowerCase().includes("not found")) {
          continue;
        }
      }
      if (cancelled) return;
      if (error) {
        return;
      }

      const rows = (data ?? []) as unknown as FocusSessionRow[];
      const durations = rows
        .map((r) => Number(r.duration ?? r.duration_minutes ?? 0))
        .filter((n) => Number.isFinite(n) && n > 0);

      const total = durations.reduce((sum, n) => sum + n, 0);
      setFocusCount(durations.length);
      setTotalFocusTime(total);
    }

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  useEffect(() => {
    if (!isActive || isSaving) return;
    if (timeLeft <= 0) return;
    if (intervalRef.current !== null) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isSaving, timeLeft]);

  useEffect(() => {
    if (timeLeft !== 0) return;
    if (!isActive) return;
    if (isSavingRef.current) return;
    if (submitGuardRef.current) return;
    submitGuardRef.current = true;
    setIsActive(false);
    void (async () => {
      await finishTraining();
    })();
  }, [timeLeft, isActive]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  function formatTime(totalSeconds: number) {
    const clamped = Math.max(0, totalSeconds);
    const m = Math.floor(clamped / 60);
    const s = clamped % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  async function finishTraining() {
    if (isSavingRef.current) return;
    if (!supabase) {
      window.alert("记录失败，请重试");
      return;
    }
    const sb = supabase;

    const targetTotalSeconds = Number(selectedDurationRef.current) * 60;
    const elapsedSeconds = Math.max(0, targetTotalSeconds - timeLeft);
    const actualMinutes = Math.floor(elapsedSeconds / 60);
    if (actualMinutes <= 1) {
      return;
    }

    setIsSaving(true);
    submitGuardRef.current = true;

    try {
      const isSchemaError = (message: string) => {
        const msg = (message || "").toLowerCase();
        return (
          msg.includes("schema cache") ||
          msg.includes("does not exist") ||
          msg.includes("not found")
        );
      };

      const basePayloads: Array<Record<string, unknown>> = [
        { duration: actualMinutes, focus_type: "deep_focus" },
        { duration_minutes: actualMinutes, focus_type: "deep_focus" },
        { duration_minutes: actualMinutes, task_name: "深度专注" },
        { duration: actualMinutes, task_name: "深度专注" },
      ];

      const payloads: Array<Record<string, unknown>> = userId
        ? basePayloads.map((p) => ({ user_id: userId, ...p }))
        : basePayloads;

      const attempts = [
        ...payloads.map((p) => () => sb.from("focus_sessions").insert(p)),
        ...payloads.map((p) => () => sb.from("focus_session").insert(p)),
      ];

      let nonSchemaError: { message?: string } | null = null;
      const schemaErrors: Array<{ message?: string }> = [];

      for (const fn of attempts) {
        const { error } = await fn();
        if (!error) {
          nonSchemaError = null;
          break;
        }
        if (isSchemaError(error.message ?? "")) {
          schemaErrors.push(error);
          continue;
        }
        nonSchemaError = error;
        break;
      }

      if (nonSchemaError) {
        window.alert(`记录失败，请重试\n${nonSchemaError.message ?? ""}`);
        return;
      }
      if (schemaErrors.length > 0) {
        window.alert(`记录失败，请重试\n${schemaErrors[0]?.message ?? ""}`);
        return;
      }

      setToast("训练记录已保存");
      window.setTimeout(() => {
        setToast(null);
      }, 1800);
      setFocusCount((prev) => prev + 1);
      setTotalFocusTime((prev) => prev + actualMinutes);
      setTimeLeft(targetTotalSeconds);
      setIsActive(false);
    } catch (err) {
      console.error("focus_session insert crashed", err);
      window.alert("记录失败，请重试");
    } finally {
      setIsSaving(false);
      submitGuardRef.current = false;
    }
  }

  const totalSeconds = Number(selectedDuration) * 60;
  const progress = totalSeconds === 0 ? 0 : (totalSeconds - timeLeft) / totalSeconds;
  const percent = Math.round(progress * 100);
  const progressDeg = Math.round(progress * 360);

  return (
    <main className="flex-1 pt-6 pb-32">
      <header>
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
            aria-label="返回"
          >
            <ArrowLeft className="h-5 w-5 text-white/80" />
          </Link>
          <button className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <Zap className="h-5 w-5 text-white/75" />
          </button>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          专注力训练
        </h1>
        <div className="mt-1 text-sm text-slate-400">建立每日专注习惯 ✨</div>
      </header>

      <section className="mt-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1E4A] to-[#050A15] border border-blue-500/30 p-5 shadow-[0_0_30px_rgba(37,99,235,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_25%_0%,rgba(0,198,255,0.12),transparent_55%),radial-gradient(760px_circle_at_90%_15%,rgba(59,130,246,0.14),transparent_55%)]" />

          <div className="relative pr-40">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/70">
              <Sparkles className="h-3.5 w-3.5 text-blue-200/80" />
              今日训练推荐
            </div>
            <div className="mt-2 text-xl font-semibold tracking-tight text-white">
              深度专注训练
            </div>
            <div className="mt-1 text-sm text-white/60">
              帮助你进入深度专注状态，提升学习效率与理解力。
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300">
                {selectedDuration}分钟
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300">
                专注提升
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300">
                适合早中晚
              </span>
            </div>
          </div>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-44 h-44 flex items-center justify-center pointer-events-none">
            <div className="absolute h-36 w-36 rounded-full bg-blue-600/15 blur-3xl" />
            <div className="absolute h-28 w-28 rounded-full border-[0.5px] border-blue-400/18" />
            <div className="absolute h-40 w-20 rounded-[100%] border-[0.5px] border-blue-300/12 rotate-12" />
            <div className="absolute h-36 w-16 rounded-[100%] border-[0.5px] border-blue-300/12 -rotate-12" />
            <div className="absolute h-24 w-44 rounded-[100%] border-[0.5px] border-blue-400/16" />
            <Brain
              size={84}
              strokeWidth={1}
              className="text-[#00C6FF] drop-shadow-[0_0_12px_rgba(0,198,255,0.55)]"
            />
          </div>
        </div>
      </section>

      <section className="mt-4">
        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4">
          <div className="text-sm font-semibold text-white">训练时长选择</div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {(
              [
                { key: "5", label: "5分钟" },
                { key: "10", label: "10分钟" },
                { key: "15", label: "15分钟" },
                { key: "25", label: "25分钟" },
              ] as const
            ).map(({ key, label }) => {
              const isActive = selectedDuration === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDuration(key)}
                  className={[
                    "h-10 rounded-full text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white shadow-[0_10px_24px_rgba(0,198,255,0.18)]"
                      : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-3">
        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4">
          <div className="text-sm font-semibold text-white">训练控制</div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => {
                if (isSaving) return;
                setIsActive(false);
                if (intervalRef.current !== null) {
                  window.clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
              }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 text-sm font-medium text-slate-200"
            >
              <Pause className="h-4 w-4 text-slate-200/80" />
              暂停
            </button>
            <button
              onClick={() => {
                if (isSaving) return;
                submitGuardRef.current = false;
                if (timeLeft <= 0) {
                  setTimeLeft(Number(selectedDuration) * 60);
                }
                setIsActive(true);
              }}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-sm font-semibold text-white shadow-[0_14px_34px_rgba(0,198,255,0.22)]"
            >
              <Play className="h-4 w-4" />
              开始训练
            </button>
            <button
              onClick={() => {
                if (isSaving) return;
                const ok = window.confirm("确定要提前结束本次训练吗？");
                if (!ok) return;
                setIsActive(false);
                if (intervalRef.current !== null) {
                  window.clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                void finishTraining();
              }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 text-sm font-medium text-slate-200"
            >
              <Square className="h-4 w-4 text-slate-200/80" />
              {isSaving ? "保存中..." : "结束"}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">当前训练状态</div>
            <div className="inline-flex items-center gap-2 text-xs text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.45)]" />
              {isSaving ? "保存中..." : isActive ? "训练中" : "已暂停"}
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-4xl font-semibold tracking-tight text-sky-100">
                {formatTime(timeLeft)}
              </div>
              <div className="mt-1 text-xs text-white/55">剩余时间</div>
            </div>

            <div className="relative h-16 w-16 shrink-0">
              <div
                className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(0,198,255,0.10)]"
                style={{
                  background: `conic-gradient(from 180deg, rgba(0,198,255,0.95) 0deg, rgba(0,114,255,0.95) ${progressDeg}deg, rgba(255,255,255,0.10) ${progressDeg}deg, rgba(255,255,255,0.06) 360deg)`,
                }}
              />
              <div className="absolute inset-[6px] rounded-full bg-[#0B1226] border border-white/10" />
              <div className="absolute inset-0 grid place-items-center text-xs font-semibold text-white/80">
                {percent}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4">
          <div className="text-sm font-semibold text-white">参数列表</div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between text-white/60">
              <span>专注模式</span>
              <span className="text-white/85">深度专注</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>呼吸节奏</span>
              <span className="text-white/85">4-4-6</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>今日目标</span>
              <span className="text-white/85">{selectedDuration}分钟</span>
            </div>
          </div>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4">
          <div className="text-sm font-semibold text-white">声音环境</div>
          <div className="mt-3 grid grid-cols-4 gap-2 mb-4">
            {(
              [
                { key: "white", label: "白噪音", Icon: Waves },
                { key: "music", label: "轻音乐", Icon: Music },
                { key: "rain", label: "雨声", Icon: CloudRain },
                { key: "nature", label: "自然声", Icon: Leaf },
              ] as const
            ).map(({ key, label, Icon }) => {
              const isActive = activeSound === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveSound(key)}
                  className={[
                    "flex flex-col items-center justify-center gap-1 py-2 rounded-xl border transition-colors",
                    isActive
                      ? "bg-[#00C6FF]/20 border border-[#00C6FF]/50 text-[#00C6FF]"
                      : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10",
                  ].join(" ")}
                >
                  <Icon size={20} />
                  <span className="text-[10px]">{label}</span>
                </button>
              );
            })}
          </div>

          <div className="w-full h-1 bg-slate-700 rounded-full flex items-center">
            <div className="w-1/2 h-full bg-[#00C6FF] rounded-full" />
            <div className="w-3 h-3 bg-white rounded-full -ml-1 shadow-[0_0_5px_#fff]" />
          </div>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4">
          <div className="text-sm font-semibold text-white">完成记录</div>
          <div className="mt-3 flex justify-between items-center">
            <div className="text-xs text-white/80">
              本周已完成 {focusCount} 次 · 累计 {totalFocusTime} 分钟
            </div>
            <div className="text-[10px] text-slate-400">积分 {points}</div>
          </div>

          <div className="flex justify-between items-center mt-3">
            {(["一", "二", "三", "四", "五", "六", "日"] as const).map((d, idx) => {
              const isChecked = idx < 5;
              return isChecked ? (
                <div key={d} className="flex flex-col items-center gap-1">
                  <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="text-[10px] text-slate-400">{d}</span>
                </div>
              ) : (
                <div key={d} className="flex flex-col items-center gap-1">
                  <div className="w-5 h-5 rounded-full border border-slate-600" />
                  <span className="text-[10px] text-slate-600">{d}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-4">
        <div className="mt-4 relative overflow-hidden bg-gradient-to-r from-blue-900/40 to-[#0A1128] border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
            <Star className="text-yellow-400 fill-yellow-400" size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">
              做得很好，今天也保持了专注！
            </div>
            <div className="mt-1 text-xs text-white/60">
              完成一次训练，就是一次进步。
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-16 border-t-2 border-blue-400/30 rounded-[100%] rotate-[-15deg]" />
        </div>
      </section>

      {toast ? (
        <div className="fixed right-4 bottom-24 z-[60] rounded-full px-3 py-1 text-[11px] font-medium bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
