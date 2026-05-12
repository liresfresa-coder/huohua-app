"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpenText,
  Check,
  Lightbulb,
  Play,
  Star,
  Video,
  Volume2,
} from "lucide-react";
import { getSupabaseClient } from "@/src/lib/supabase";

type CourseDetailTab = "video" | "audio" | "text";

type CourseDetailMock = {
  title: string;
  lessonTitle: string;
  points: string[];
  completedLessons: number;
  totalLessons: number;
  percent: number;
};

const mockById: Record<string, CourseDetailMock> = {
  "focus-1": {
    title: "专注力提升课",
    lessonTitle: "第 3 节：高效进入专注状态",
    points: [
      "识别分心信号：快速把注意力拉回任务",
      "建立“开始仪式”：用 30 秒进入专注轨道",
      "环境与节律：让专注更久、更稳定",
      "复盘策略：用最小代价获得最大提升",
    ],
    completedLessons: 5,
    totalLessons: 12,
    percent: 45,
  },
  "focus-2": {
    title: "学习效率提升课",
    lessonTitle: "第 2 节：建立高效学习节奏",
    points: ["拆解目标到分钟", "任务切换成本降低", "建立可执行的复盘模板"],
    completedLessons: 2,
    totalLessons: 10,
    percent: 20,
  },
  "focus-3": {
    title: "每日训练营",
    lessonTitle: "第 1 节：进入训练状态",
    points: ["每日 15 分钟", "坚持优先于强度", "阶段复盘与调整"],
    completedLessons: 0,
    totalLessons: 30,
    percent: 0,
  },
  "focus-4": {
    title: "脑机基础认知",
    lessonTitle: "第 5 节：训练数据怎么看",
    points: ["指标含义与区间", "训练强度建议", "常见问题排查", "循序渐进的策略"],
    completedLessons: 5,
    totalLessons: 12,
    percent: 45,
  },
};

type CourseDbRow = Record<string, unknown>;
type LessonDbRow = Record<string, unknown>;

type CourseInfo = { title: string; description: string };
type LessonInfo = { id: string; contentUrl: string; lessonType: string };

export default function CourseDetail({ courseId: courseIdProp }: { courseId?: string }) {
  const params = useParams<{ id?: string }>();
  const courseId = (params?.id ?? courseIdProp ?? "").toString();

  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);

  const mock = useMemo(() => mockById[courseId] ?? mockById["focus-1"], [courseId]);

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseInfo>({ title: "", description: "" });
  const [lessons, setLessons] = useState<LessonInfo[]>([]);

  const [tab, setTab] = useState<CourseDetailTab>("video");
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(() => ({
    completedLessons: mock.completedLessons,
    totalLessons: mock.totalLessons,
    percent: mock.percent,
  }));
  const [toast, setToast] = useState<null | "本节已完成">(null);

  function pickString(row: CourseDbRow, keys: string[]) {
    for (const k of keys) {
      const v = row[k];
      if (typeof v === "string" && v.trim()) return v;
    }
    return "";
  }

  function pickId(row: LessonDbRow) {
    const direct = row.id ?? row.lesson_id ?? row.uuid ?? row._id;
    if (typeof direct === "string" && direct.trim()) return direct;
    if (typeof direct === "number" && Number.isFinite(direct)) return String(direct);
    return "";
  }

  function isMissingColumn(message: string, column: string) {
    const msg = (message || "").toLowerCase();
    const c = column.toLowerCase();
    return msg.includes(c) && (msg.includes("does not exist") || msg.includes("schema cache"));
  }

  useEffect(() => {
    setProgress({
      completedLessons: mock.completedLessons,
      totalLessons: mock.totalLessons,
      percent: mock.percent,
    });
    setIsCompleted(false);
    setToast(null);
  }, [courseId, mock.completedLessons, mock.totalLessons, mock.percent]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase || !courseId) {
        if (!cancelled) setLoading(false);
        return;
      }

      const isDbId = /^\d+$/.test(courseId);
      if (!isDbId) {
        if (!cancelled) {
          setCourse({ title: "", description: "" });
          setLessons([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      const loadCourse = async () => {
        const { data, error } = await supabase
          .from("course")
          .select("*")
          .eq("id", courseId)
          .maybeSingle();
        if (error) {
          console.error("course load failed:", error);
          return { title: "", description: "" } satisfies CourseInfo;
        }
        const row = (data ?? {}) as unknown as CourseDbRow;
        const title = pickString(row, ["title", "name", "course_title", "course_name", "courseName"]);
        const description = pickString(row, ["description", "summary", "intro", "brief", "subtitle"]);
        return { title, description } satisfies CourseInfo;
      };

      const loadLessons = async () => {
        const eqColumns = ["course_id", "courseId", "courseid"] as const;
        const orderAttempts = [
          { column: "sort_order", ascending: true as const },
        ] as const;

        for (const eqCol of eqColumns) {
          for (const ord of orderAttempts) {
            const attempt = await supabase
              .from("lesson")
              .select("*")
              .eq(eqCol, courseId)
              .order(ord.column, { ascending: ord.ascending });

            if (!attempt.error) {
              const rows = (attempt.data ?? []) as unknown as LessonDbRow[];
              return rows;
            }

            const msg = attempt.error.message ?? "";
            if (isMissingColumn(msg, eqCol)) break;
            if (isMissingColumn(msg, ord.column)) continue;
            break;
          }
        }

        const attemptFallback = await supabase.from("lesson").select("*").eq("course_id", courseId);
        if (attemptFallback.error) {
          console.error("lesson load failed:", attemptFallback.error);
          return [] as LessonDbRow[];
        }
        return (attemptFallback.data ?? []) as unknown as LessonDbRow[];
      };

      const [courseInfo, lessonRows] = await Promise.all([loadCourse(), loadLessons()]);
      if (cancelled) return;

      setCourse(courseInfo);
      const mappedLessons: LessonInfo[] = (lessonRows ?? [])
        .map((r) => {
          const id = pickId(r);
          const contentUrl = pickString(r, ["content_url", "media_url", "video_url", "url"]);
          const lessonType = pickString(r, ["lesson_type", "type", "content_type"]);
          if (lessonType.trim().toLowerCase() === "meta") return null;
          if (!id) return null;
          return { id, contentUrl, lessonType } satisfies LessonInfo;
        })
        .filter(Boolean) as LessonInfo[];

      setLessons(mappedLessons);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase, courseId]);

  function completeLesson() {
    if (isCompleted) return;
    setIsCompleted(true);
    setToast("本节已完成");
    window.setTimeout(() => setToast(null), 1600);
    setProgress((prev) => {
      const nextCompleted = Math.min(prev.totalLessons, prev.completedLessons + 1);
      const nextPercent =
        prev.totalLessons <= 0
          ? 0
          : Math.round((nextCompleted / prev.totalLessons) * 100);
      return {
        completedLessons: nextCompleted,
        totalLessons: prev.totalLessons,
        percent: nextPercent,
      };
    });
  }

  const activeLesson = useMemo(() => {
    const withContent = lessons.find((l) => Boolean(l.contentUrl));
    return withContent ?? lessons[0] ?? null;
  }, [lessons]);

  const courseTitle = course.title || mock.title;
  const courseDescription = course.description || "—";

  return (
    <main className="flex-1 pt-6 pb-32 bg-[#020617]">
      <header className="flex items-center justify-between">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-3 py-2"
          aria-label="返回课程中心"
        >
          <ArrowLeft className="h-4 w-4 text-white/80" />
          <span className="text-xs font-semibold text-white/80">
            返回课程中心
          </span>
        </Link>

        <button className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <Star className="h-5 w-5 text-white/75" />
        </button>
      </header>

      <section className="mt-5">
        {loading ? (
          <div className="w-full aspect-video bg-black rounded-2xl outline-none border border-cyan-500/30 shadow-[0_0_20px_rgba(0,198,255,0.15)] animate-pulse" />
        ) : activeLesson?.contentUrl ? (
          <video
            key={activeLesson.contentUrl}
            controls
            src={activeLesson.contentUrl}
            className="w-full aspect-video bg-black rounded-2xl outline-none border border-cyan-500/30 shadow-[0_0_20px_rgba(0,198,255,0.15)]"
          />
        ) : (
          <div className="w-full aspect-video bg-black rounded-2xl outline-none border border-cyan-500/30 shadow-[0_0_20px_rgba(0,198,255,0.15)] grid place-items-center">
            <div className="text-xs text-cyan-200/80">
              指挥官，该课程暂未挂载内容信号
            </div>
          </div>
        )}
      </section>

      <section className="mt-5">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 w-2/3 rounded-2xl bg-white/10" />
            <div className="mt-3 h-4 w-full rounded-2xl bg-white/10" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-semibold tracking-tight text-white">
              {courseTitle}
            </div>
            <div className="mt-2 text-xs leading-5 text-white/60">
              {courseDescription}
            </div>
          </>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setTab("video")}
            className={[
              "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl text-xs font-semibold",
              tab === "video"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50"
                : "bg-white/5 text-white/70 border border-white/10",
            ].join(" ")}
          >
            <Video className="h-4 w-4" />
            视频
          </button>
          <button
            onClick={() => setTab("audio")}
            className={[
              "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl text-xs font-semibold",
              tab === "audio"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50"
                : "bg-white/5 text-white/70 border border-white/10",
            ].join(" ")}
          >
            <Volume2 className="h-4 w-4" />
            音频
          </button>
          <button
            onClick={() => setTab("text")}
            className={[
              "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl text-xs font-semibold",
              tab === "text"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50"
                : "bg-white/5 text-white/70 border border-white/10",
            ].join(" ")}
          >
            <BookOpenText className="h-4 w-4" />
            图文
          </button>
        </div>
      </section>

      <section className="mt-5 grid gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
            <span className="grid h-8 w-8 place-items-center rounded-2xl bg-cyan-500/15 ring-1 ring-cyan-400/25">
              <Lightbulb className="h-4 w-4 text-cyan-200" />
            </span>
            本节要点
          </div>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-white/70">
            {mock.points.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/80" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white/90">当前学习进度</div>
            <div className="text-xs text-white/60">
              已学 {progress.completedLessons} / {progress.totalLessons} 节，
              {progress.percent}%
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
            <div
              className="relative h-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,198,255,0.35)]"
              style={{ width: `${progress.percent}%` }}
            >
              <span className="absolute right-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.55)]" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="grid grid-cols-4 gap-3">
          <button className="col-span-1 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/80 text-sm font-semibold">
            上一节
          </button>
          <button className="col-span-1 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/80 text-sm font-semibold">
            下一节
          </button>
          <button
            onClick={() => completeLesson()}
            className="col-span-2 h-12 rounded-2xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white text-sm font-semibold shadow-[0_18px_40px_rgba(0,198,255,0.18)] flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" /> 完成学习
          </button>
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
