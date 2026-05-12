"use client";

import {
  Bell,
  Brain,
  ArrowRight,
  BookOpen,
  Cpu,
  Flame,
  Folder,
  Lock,
  Rocket,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/src/lib/supabase";

type CourseRow = {
  id: string;
  title: string;
  description: string;
  category: string;
};

type CourseDbRow = Record<string, unknown>;

const mockCourses: CourseRow[] = [
  {
    id: "focus-1",
    title: "专注力提升课",
    description: "用更少的意志力，进入更稳定的专注状态",
    category: "专注力课程",
  },
  {
    id: "focus-2",
    title: "学习效率提升课",
    description: "建立高效学习节奏，降低任务切换成本",
    category: "专注力课程",
  },
  {
    id: "focus-3",
    title: "每日训练营",
    description: "每日 15 分钟，持续积累可见的改变",
    category: "训练课程",
  },
  {
    id: "focus-4",
    title: "脑机基础认知",
    description: "看懂训练指标与区间，掌握循序渐进策略",
    category: "家长课",
  },
];

export default function CoursesPage() {
  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  function pickString(row: CourseDbRow, keys: string[]) {
    for (const k of keys) {
      const v = row[k];
      if (typeof v === "string" && v.trim()) return v;
    }
    return "";
  }

  function pickBoolean(row: CourseDbRow, keys: string[]) {
    for (const k of keys) {
      const v = row[k];
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v !== 0;
    }
    return false;
  }

  function pickId(row: CourseDbRow) {
    const direct = row.id ?? row.course_id ?? row.courseId ?? row.uuid ?? row._id;
    if (typeof direct === "string" && direct.trim()) return direct;
    if (typeof direct === "number" && Number.isFinite(direct)) return String(direct);
    return "";
  }

  function mapDbRow(row: CourseDbRow): CourseRow | null {
    const id = pickId(row);
    if (!id) return null;
    const title = pickString(row, ["title", "name", "course_title", "course_name", "courseName"]);
    const description = pickString(row, ["description", "summary", "intro", "brief", "subtitle"]);
    const category = pickString(row, ["category", "course_category", "type", "kind"]);
    return {
      id,
      title: title || "未命名课程",
      description: description || "—",
      category: category || "",
    };
  }

  function pickIcon(course: CourseRow) {
    const hay = `${course.title} ${course.category}`.toLowerCase();
    if (hay.includes("专注")) return Target;
    if (hay.includes("效率")) return Rocket;
    if (hay.includes("营") || hay.includes("打卡")) return Flame;
    if (hay.includes("脑")) return Cpu;
    return BookOpen;
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase) {
        if (!cancelled) setLoading(false);
        return;
      }

      setLoading(true);

      const isMissingColumn = (message: string, column: string) => {
        const msg = (message || "").toLowerCase();
        return msg.includes(column.toLowerCase()) && (msg.includes("does not exist") || msg.includes("schema cache"));
      };

      const attemptPrimary = await supabase
        .from("course")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (!cancelled && attemptPrimary.error) {
        const msg = attemptPrimary.error.message ?? "";
        if (isMissingColumn(msg, "sort_order")) {
          const attemptCreatedAt = await supabase
            .from("course")
            .select("*")
            .eq("is_published", true)
            .order("created_at", { ascending: false });

          if (!cancelled && attemptCreatedAt.error) {
            if (isMissingColumn(attemptCreatedAt.error.message ?? "", "created_at")) {
              const fallback = await supabase.from("course").select("*").eq("is_published", true);
              if (cancelled) return;
              if (fallback.error) {
                console.error("course load failed:", fallback.error);
                setCourses([]);
                setLoading(false);
                return;
              }
              const rows = (fallback.data ?? []) as unknown as CourseDbRow[];
              setCourses(rows.map(mapDbRow).filter(Boolean) as CourseRow[]);
              setLoading(false);
              return;
            }

            console.error("course load failed:", attemptCreatedAt.error);
            setCourses([]);
            setLoading(false);
            return;
          }

          if (cancelled) return;
          const rows = (attemptCreatedAt.data ?? []) as unknown as CourseDbRow[];
          setCourses(rows.map(mapDbRow).filter(Boolean) as CourseRow[]);
          setLoading(false);
          return;
        }

        if (isMissingColumn(msg, "is_published")) {
          const fallback = await supabase.from("course").select("*").order("created_at", { ascending: false });
          if (cancelled) return;
          if (fallback.error) {
            console.error("course load failed:", fallback.error);
            setCourses([]);
            setLoading(false);
            return;
          }

          const rows = (fallback.data ?? []) as unknown as CourseDbRow[];
          const publishedRows = rows.filter((r) =>
            pickBoolean(r, ["is_published", "published", "isPublished", "is_publish"]),
          );
          setCourses(publishedRows.map(mapDbRow).filter(Boolean) as CourseRow[]);
          setLoading(false);
          return;
        }

        console.error("course load failed:", attemptPrimary.error);
        setCourses([]);
        setLoading(false);
        return;
      }

      if (cancelled) return;
      const rows = ((attemptPrimary.data ?? []) as unknown as CourseDbRow[]).map(mapDbRow).filter(Boolean) as CourseRow[];
      setCourses(rows);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const displayCourses = !loading && courses.length === 0 ? mockCourses : courses;

  return (
    <main className="relative flex-1 w-full overflow-x-hidden pt-6 pb-32 bg-[#020617]">
      <header>
        <div className="flex justify-between items-center mb-6">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-200">
            <Brain className="h-5 w-5 text-[#00C6FF] drop-shadow-[0_0_12px_rgba(0,198,255,0.45)]" />
            <span>火花脑机</span>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <Bell className="h-5 w-5 text-white/75" />
          </button>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            课程中心
          </h1>
          <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,198,255,0.8)]" />
        </div>
      </header>

      <section className="mt-4">
        {!loading && displayCourses.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500/12 to-blue-600/8 border border-cyan-400/25 text-cyan-200 shadow-[0_0_18px_rgba(0,198,255,0.14)]">
              <Folder className="h-7 w-7" />
            </div>
            <div className="mt-4 text-sm font-semibold text-white/90">指挥官，暂无上架课程</div>
            <div className="mt-2 text-xs text-white/55">请前往后台配置并上架课程</div>
          </div>
        ) : (
          displayCourses.map((course) => {
            const Icon = pickIcon(course);
            const progress = 0;
            const locked = false;
            return (
              <article
                key={course.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-4 flex gap-4 items-center"
              >
                <div
                  className={[
                    "flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-400/30 text-cyan-400 shadow-[0_0_15px_rgba(0,198,255,0.25)] shrink-0",
                    locked ? "opacity-70" : "",
                  ].join(" ")}
                >
                  <Icon size={28} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-white">
                        {course.title}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/60">
                        {course.description}
                      </div>
                    </div>
                    {locked ? (
                      <button className="bg-[#161C2D] border border-white/10 text-slate-400 px-4 py-2 rounded-full text-xs flex items-center gap-1 shrink-0">
                        待解锁 <Lock size={14} />
                      </button>
                    ) : (
                      <Link
                        href={`/courses/${course.id}`}
                        className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white shadow-lg shadow-blue-500/30 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1 shrink-0"
                      >
                        开始学习 <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-light text-white/55">
                      <span>已学 {locked ? 0 : progress}%</span>
                      <span>{locked ? 0 : progress}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-700">
                      <div
                        className="relative h-1.5 rounded-full bg-[#00C6FF]"
                        style={{ width: locked ? "0%" : `${progress}%` }}
                      >
                        <span className="absolute right-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.55)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
