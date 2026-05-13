"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  ChevronsLeft,
  Database,
  LayoutDashboard,
  PencilLine,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Tags,
  Trash2,
  UploadCloud,
  Users,
} from "lucide-react";
import { getSupabaseClient } from "@/src/lib/supabase";

type MenuKey =
  | "dashboard"
  | "users"
  | "courses"
  | "categories"
  | "data"
  | "private"
  | "home"
  | "system";

type CourseRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  learners: number;
  published: boolean;
  courseType?: "video" | "live";
  contentUrl?: string;
  liveUrl?: string;
  liveTime?: string;
  metaLessonId?: string;
  contentLessonId?: string;
};

type CourseDbRow = Record<string, unknown>;
type LessonDbRow = Record<string, unknown>;

const menuItems: Array<{
  key: MenuKey;
  label: string;
  Icon: React.ElementType;
  href?: string;
}> = [
  { key: "dashboard", label: "仪表盘", Icon: LayoutDashboard, href: "/admin" },
  { key: "users", label: "用户管理", Icon: Users, href: "/admin/users" },
  { key: "courses", label: "课程管理", Icon: BookOpen, href: "/admin/courses" },
  { key: "categories", label: "内容分类", Icon: Tags, href: "/admin/categories" },
  { key: "data", label: "数据中心", Icon: Database, href: "/admin/data" },
  { key: "private", label: "私域配置", Icon: SlidersHorizontal, href: "/admin/private" },
  { key: "home", label: "首页配置", Icon: SlidersHorizontal, href: "/admin/home" },
  { key: "system", label: "系统设置", Icon: Settings, href: "/admin/system" },
];

function Tag({ children }: { children: string }) {
  const tone =
    children === "专注力课程"
      ? "bg-cyan-500/12 border-cyan-400/25 text-cyan-200"
      : children === "家长课"
        ? "bg-indigo-500/12 border-indigo-400/25 text-indigo-200"
        : "bg-emerald-500/12 border-emerald-400/25 text-emerald-200";
  return (
    <span className={["inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", tone].join(" ")}>
      {children}
    </span>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        published
          ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-200"
          : "bg-white/5 border-slate-700/50 text-slate-200/70",
      ].join(" ")}
    >
      <span
        className={[
          "h-2 w-2 rounded-full",
          published
            ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.20)]"
            : "bg-white/30",
        ].join(" ")}
      />
      {published ? "已上架" : "未上架"}
    </span>
  );
}

function Modal({
  isOpen,
  onClose,
  mode,
  formData,
  setFormData,
  handleSave,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  formData: {
    title: string;
    description: string;
    category: string;
    courseType: "video" | "live";
    contentUrl: string;
    liveUrl: string;
    liveTime: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
      category: string;
      courseType: "video" | "live";
      contentUrl: string;
      liveUrl: string;
      liveTime: string;
    }>
  >;
  handleSave: (e: { preventDefault: () => void; stopPropagation: () => void }) => void;
  isSaving: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center">
      <div className="w-[90%] max-w-lg bg-[#131B2F] border border-slate-700/50 rounded-xl p-6 shadow-[0_0_30px_rgba(0,198,255,0.10)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-white/90">
              {mode === "create" ? "新建课程" : "编辑课程"}
            </div>
            <div className="mt-1 text-xs text-slate-300/70">
              维护课程信息与分类，支持后续对接 Supabase
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl bg-white/5 border border-slate-700/50 text-slate-100/70 hover:bg-white/10"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <div className="text-xs text-slate-200/70">课程标题</div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl bg-white/5 border border-slate-700/50 px-3 text-sm text-white placeholder:text-slate-400/60 focus:outline-none focus:border-cyan-400/40 focus:shadow-[0_0_18px_rgba(0,198,255,0.12)]"
              placeholder="例如：专注力提升课"
            />
          </div>

          <div>
            <div className="text-xs text-slate-200/70">课程简介</div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-2 min-h-[92px] w-full rounded-xl bg-white/5 border border-slate-700/50 px-3 py-2 text-sm text-white placeholder:text-slate-400/60 focus:outline-none focus:border-cyan-400/40 focus:shadow-[0_0_18px_rgba(0,198,255,0.12)]"
              placeholder="一句话描述课程亮点"
            />
          </div>

          <div>
            <div className="text-xs text-slate-200/70">课程封面</div>
            <div className="mt-2 rounded-xl border border-dashed border-slate-600/70 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-500/12 border border-cyan-400/25 text-cyan-200">
                  <UploadCloud className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white/85">
                    拖拽上传封面
                  </div>
                  <div className="mt-1 text-[11px] text-slate-300/70">
                    支持 JPG/PNG 格式，建议比例 16:9 (如 1280x720)，文件不超过 2MB
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-200/70">课程类型</div>
            <div className="mt-2">
              <select
                value={formData.courseType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    courseType: (e.target.value as "video" | "live") || "video",
                  })
                }
                className="h-11 w-full rounded-xl bg-white/5 border border-slate-700/50 px-3 text-sm text-white focus:outline-none focus:border-cyan-400/40 focus:shadow-[0_0_18px_rgba(0,198,255,0.12)]"
                style={{ colorScheme: "dark" }}
              >
                <option className="bg-[#0f172a] text-slate-200" value="video">
                  录播课程 (Video/Audio)
                </option>
                <option className="bg-[#0f172a] text-slate-200" value="live">
                  直播课程 (Live Stream)
                </option>
              </select>
            </div>
          </div>

          {formData.courseType === "video" ? (
            <div>
              <div className="text-xs text-slate-200/70">视频/音频播放链接 (URL)</div>
              <input
                type="text"
                value={formData.contentUrl}
                onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl bg-white/5 border border-slate-700/50 px-3 text-sm text-white placeholder:text-slate-400/60 focus:outline-none focus:border-cyan-400/40 focus:shadow-[0_0_18px_rgba(0,198,255,0.12)]"
                placeholder="请输入阿里云OSS或第三方视频直链..."
              />
            </div>
          ) : (
            <div className="grid gap-4">
              <div>
                <div className="text-xs text-slate-200/70">直播间链接</div>
                <input
                  type="text"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  className="mt-2 h-11 w-full rounded-xl bg-white/5 border border-slate-700/50 px-3 text-sm text-white placeholder:text-slate-400/60 focus:outline-none focus:border-cyan-400/40 focus:shadow-[0_0_18px_rgba(0,198,255,0.12)]"
                  placeholder="请输入直播间链接..."
                />
              </div>
              <div>
                <div className="text-xs text-slate-200/70">开播时间（可选）</div>
                <input
                  type="text"
                  value={formData.liveTime}
                  onChange={(e) => setFormData({ ...formData, liveTime: e.target.value })}
                  className="mt-2 h-11 w-full rounded-xl bg-white/5 border border-slate-700/50 px-3 text-sm text-white placeholder:text-slate-400/60 focus:outline-none focus:border-cyan-400/40 focus:shadow-[0_0_18px_rgba(0,198,255,0.12)]"
                  placeholder="例如：2025-06-20 20:00"
                />
              </div>
            </div>
          )}

          <div>
            <div className="text-xs text-slate-200/70">课程分类</div>
            <div className="mt-2">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-11 w-full rounded-xl bg-white/5 border border-slate-700/50 px-3 text-sm text-white focus:outline-none focus:border-cyan-400/40 focus:shadow-[0_0_18px_rgba(0,198,255,0.12)]"
                style={{ colorScheme: "dark" }}
              >
                <option className="bg-[#0f172a] text-slate-200" value="专注力课程">
                  专注力课程
                </option>
                <option className="bg-[#0f172a] text-slate-200" value="家长课">
                  家长课
                </option>
                <option className="bg-[#0f172a] text-slate-200" value="训练课程">
                  训练课程
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-11 rounded-xl bg-white/5 border border-slate-700/50 px-4 text-sm font-semibold text-slate-100/75 hover:bg-white/10"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-11 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] px-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,198,255,0.18)] disabled:opacity-60"
          >
            {isSaving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCourseList() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem("huohua_admin") === "true";
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState("");

  useEffect(() => {
    try {
      if (localStorage.getItem("huohua_admin") === "true") setIsAuthenticated(true);
    } catch {}
  }, []);

  function verify() {
    const normalized = password
      .trim()
      .replace(/\u3000/g, " ")
      .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
      .toLowerCase();
    if (normalized === "admin888") {
      try {
        localStorage.setItem("huohua_admin", "true");
      } catch {}
      setIsAuthenticated(true);
      setPassword("");
      return;
    }
    window.alert("指挥官身份核验失败");
  }

  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);
  const pathname = usePathname();
  const router = useRouter();
  const navTapGuardRef = useRef(0);

  function go(href: string) {
    const now = Date.now();
    if (now - navTapGuardRef.current < 450) return;
    navTapGuardRef.current = now;
    router.push(href);
  }

  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const initialState = {
    title: "",
    description: "",
    category: "专注力课程",
    courseType: "video" as "video" | "live",
    contentUrl: "",
    liveUrl: "",
    liveTime: "",
  };
  const [formData, setFormData] = useState(initialState);

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [courseSchema, setCourseSchema] = useState<{
    titleKey: string | null;
    descriptionKey: string | null;
    categoryKey: string | null;
  }>({ titleKey: null, descriptionKey: null, categoryKey: null });
  const [courseColumnSet, setCourseColumnSet] = useState<Set<string> | null>(null);
  const [courseColumnMeta, setCourseColumnMeta] = useState<Array<{ name: string; type: string }> | null>(null);
  const openApiStatusRef = useRef<"idle" | "loading" | "loaded">("idle");
  const [courseSampleRows, setCourseSampleRows] = useState<CourseDbRow[]>([]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1600);
  }

  function normalizeKey(s: string) {
    return s.replace(/[_\-\s]/g, "").toLowerCase();
  }

  function pickColumnBySynonyms(columns: string[], synonyms: string[]) {
    const normalized = columns.map((c) => [c, normalizeKey(c)] as const);
    const synonymNormalized = synonyms.map((s) => normalizeKey(s));
    for (const sn of synonymNormalized) {
      for (const [orig, nn] of normalized) {
        if (nn === sn) return orig;
      }
    }
    for (const sn of synonymNormalized) {
      for (const [orig, nn] of normalized) {
        if (nn.includes(sn) || sn.includes(nn)) return orig;
      }
    }
    return null;
  }

  async function ensureCourseOpenApi() {
    if (openApiStatusRef.current === "loaded" || openApiStatusRef.current === "loading") return;
    openApiStatusRef.current = "loading";

    const urlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!urlRaw || !anonKey) {
      openApiStatusRef.current = "idle";
      return;
    }

    let origin = urlRaw;
    try {
      origin = new URL(urlRaw).origin;
    } catch {
      openApiStatusRef.current = "idle";
      return;
    }

    try {
      const res = await fetch(`${origin}/rest/v1/`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          Accept: "application/openapi+json",
        },
      });
      if (!res.ok) {
        let body = "";
        try {
          body = (await res.text()).slice(0, 240);
        } catch {
          body = "";
        }
        console.error(
          `course openapi load failed: status=${res.status} statusText=${res.statusText} contentType=${res.headers.get("content-type") ?? ""} body=${body}`,
        );
        openApiStatusRef.current = "idle";
        return;
      }
      const spec = (await res.json()) as unknown as {
        components?: {
          schemas?: Record<
            string,
            {
              properties?: Record<string, { type?: string; format?: string }>;
            }
          >;
        };
      };
      const schemas = spec.components?.schemas;
      if (!schemas) {
        openApiStatusRef.current = "idle";
        return;
      }

      const schemaKey =
        Object.keys(schemas).find((k) => k === "course") ??
        Object.keys(schemas).find((k) => k.toLowerCase() === "course") ??
        null;
      if (!schemaKey) {
        openApiStatusRef.current = "idle";
        return;
      }

      const props = schemas[schemaKey]?.properties;
      if (!props) {
        openApiStatusRef.current = "idle";
        return;
      }

      const columns = Object.keys(props);
      if (!columns.length) {
        openApiStatusRef.current = "idle";
        return;
      }

      setCourseColumnSet(new Set(columns));
      setCourseColumnMeta(
        columns.map((name) => ({ name, type: props[name]?.type ?? "unknown" })),
      );

      const stringColumns = columns.filter((c) => (props[c]?.type ?? "unknown") === "string");
      const fallbackTitleKey =
        stringColumns.find((c) => !/(^id$|created_at|updated_at|is_published|published|sort_order)/i.test(c)) ??
        stringColumns[0] ??
        null;
      const titleKey =
        pickColumnBySynonyms(columns, ["title", "name", "course", "课程", "标题", "名称"]) ??
        fallbackTitleKey;
      const descriptionKey =
        pickColumnBySynonyms(columns, ["description", "intro", "summary", "简介", "描述"]) ?? null;
      const categoryKey =
        pickColumnBySynonyms(columns, ["category", "type", "kind", "分类"]) ?? null;
      setCourseSchema((prev) => ({
        titleKey: titleKey ?? prev.titleKey,
        descriptionKey: descriptionKey ?? prev.descriptionKey,
        categoryKey: categoryKey ?? prev.categoryKey,
      }));
      openApiStatusRef.current = "loaded";
    } catch {
      console.error("course openapi load failed: network_error");
      openApiStatusRef.current = "idle";
      return;
    }
  }

  function formatSupabaseError(error: {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
  }) {
    return [
      error.code ? `code: ${error.code}` : "",
      error.message ? `message: ${error.message}` : "",
      error.details ? `details: ${error.details}` : "",
      error.hint ? `hint: ${error.hint}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function stableLearners(id: string) {
    let h = 0;
    for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return 500 + (h % 20000);
  }

  function detectBestKey(
    rows: CourseDbRow[],
    preferred: string[],
    fallbackMatch: (key: string) => boolean,
  ) {
    for (const k of preferred) {
      for (const row of rows) {
        const v = row[k];
        if (typeof v === "string" && v.trim()) return k;
      }
    }

    const sample = rows.find((r) => r && typeof r === "object");
    if (!sample) return null;
    for (const k of Object.keys(sample)) {
      if (!fallbackMatch(k)) continue;
      for (const row of rows) {
        const v = row[k];
        if (typeof v === "string" && v.trim()) return k;
      }
    }
    return null;
  }

  function computeSchemaFromRows(rows: CourseDbRow[]) {
    const sample = rows.slice(0, 20);
    const columns = Array.from(new Set(sample.flatMap((r) => Object.keys(r ?? {}))));
    const findByName = (re: RegExp) => columns.find((c) => re.test(c)) ?? null;
    const titleFallback =
      columns.find((c) => {
        if (/(^id$|created_at|updated_at|is_published|published|sort_order)/i.test(c)) return false;
        return sample.some((r) => typeof r?.[c] === "string");
      }) ??
      columns.find((c) => sample.some((r) => typeof r?.[c] === "string")) ??
      null;

    const titleKey =
      findByName(/(title|name|course|课程|标题|名称)/i) ??
      pickColumnBySynonyms(columns, ["title", "name", "course", "课程", "标题", "名称"]) ??
      detectBestKey(sample, ["course", "name", "title"], (k) => /(title|name)/i.test(k) || k === "course") ??
      titleFallback;
    const descriptionKey =
      findByName(/(description|desc|intro|summary|简介|描述)/i) ??
      pickColumnBySynonyms(columns, ["description", "intro", "summary", "简介", "描述"]) ??
      detectBestKey(sample, ["description", "intro", "summary"], (k) => /(desc|intro|summary|brief|subtitle)/i.test(k));
    const categoryKey =
      findByName(/(category|type|kind|course_category|分类)/i) ??
      pickColumnBySynonyms(columns, ["category", "type", "kind", "分类"]) ??
      detectBestKey(sample, ["category", "type", "course_category"], (k) => /(category|type|kind)/i.test(k));

    return {
      columns,
      titleKey,
      descriptionKey,
      categoryKey,
    };
  }

  function inferSchemaFromRows(rows: CourseDbRow[]) {
    if (!rows.length) return;
    const sample = rows.slice(0, 20);
    const columns = Array.from(
      new Set(sample.flatMap((r) => Object.keys(r ?? {}))),
    );
    if (!columns.length) return;

    setCourseColumnSet((prev) => prev ?? new Set(columns));

    const computed = computeSchemaFromRows(rows);

    setCourseSchema((prev) => ({
      titleKey: computed.titleKey ?? prev.titleKey,
      descriptionKey: computed.descriptionKey ?? prev.descriptionKey,
      categoryKey: computed.categoryKey ?? prev.categoryKey,
    }));
  }

  function extractMissingColumn(error: { code?: string | null; message?: string | null }) {
    const message = error.message ?? "";
    const pgrst = message.match(/Could not find the '([^']+)' column/i);
    if (pgrst?.[1]) return pgrst[1];
    const pg = message.match(/column\s+[^.]+\.(\w+)\s+does not exist/i);
    if (pg?.[1]) return pg[1];
    const pg2 = message.match(/column\s+(\w+)\s+does not exist/i);
    if (pg2?.[1]) return pg2[1];
    return null;
  }

  function removeKey(payload: Record<string, unknown>, key: string) {
    if (!(key in payload)) return payload;
    const next = { ...payload };
    delete next[key];
    return next;
  }

  function isProtectedColumnKey(key: string) {
    const k = key.toLowerCase();
    return (
      k === "title" ||
      k === "name" ||
      k === "course_title" ||
      k === "course_name" ||
      k === "course" ||
      k === "coursename" ||
      k === "coursetitle"
    );
  }

  function buildCoursePayloads(input: {
    title: string;
    description: string;
    category: string;
    courseType: "video" | "live";
    contentUrl: string;
    liveUrl: string;
    liveTime: string;
    publishedValue: boolean;
    titleKeyHint?: string | null;
    descriptionKeyHint?: string | null;
    categoryKeyHint?: string | null;
  }) {
    const uniq = (arr: string[]) => {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const v of arr) {
        if (!v) continue;
        if (seen.has(v)) continue;
        seen.add(v);
        out.push(v);
      }
      return out;
    };

    const titleKeys = uniq([
      input.titleKeyHint || "",
      "course",
      "name",
      "Course",
      "Name",
      "courseName",
      "CourseName",
    ]);

    const descKeys = uniq([
      input.descriptionKeyHint || "",
      "description",
      "intro",
      "summary",
      "Description",
      "Intro",
      "Summary",
      "brief",
      "subtitle",
      "Brief",
      "Subtitle",
    ]);

    const categoryKeys = uniq([
      input.categoryKeyHint || "",
      "category",
      "type",
      "Category",
      "Type",
      "course_category",
      "kind",
    ]);

    const publishedKeys = uniq(["is_published", "published", "isPublished", "IsPublished"]);
    const courseTypeKeys = uniq(["course_type", "content_type", "lesson_type", "CourseType"]);
    const contentUrlKeys = uniq(["content_url", "url", "media_url", "video_url", "audio_url", "ContentUrl"]);
    const liveUrlKeys = uniq(["live_url", "stream_url", "room_url", "meeting_url", "LiveUrl"]);
    const liveTimeKeys = uniq(["live_time", "start_time", "start_at", "LiveTime"]);

    const payloads: Array<Record<string, unknown>> = [];
    const publishedKeyPrimary = publishedKeys[0] || "is_published";
    const courseTypeKeyPrimary = courseTypeKeys[0] || "course_type";

    for (const tKey of titleKeys) {
      payloads.push({ [tKey]: input.title });
      payloads.push({ [tKey]: input.title, [publishedKeyPrimary]: input.publishedValue });

      if (input.description.trim()) {
        for (const dKey of descKeys.slice(0, 3)) {
          payloads.push({
            [tKey]: input.title,
            [dKey]: input.description.trim(),
            [publishedKeyPrimary]: input.publishedValue,
          });
        }
      }

      if (input.category.trim()) {
        for (const cKey of categoryKeys.slice(0, 2)) {
          payloads.push({
            [tKey]: input.title,
            [cKey]: input.category.trim(),
            [publishedKeyPrimary]: input.publishedValue,
          });
        }
      }

      payloads.push({
        [tKey]: input.title,
        [courseTypeKeyPrimary]: input.courseType,
        [publishedKeyPrimary]: input.publishedValue,
      });

      if (input.courseType === "video") {
        for (const urlKey of contentUrlKeys.slice(0, 2)) {
          payloads.push({
            [tKey]: input.title,
            [courseTypeKeyPrimary]: input.courseType,
            [urlKey]: input.contentUrl.trim() || null,
            [publishedKeyPrimary]: input.publishedValue,
          });
        }
      } else {
        for (const urlKey of liveUrlKeys.slice(0, 2)) {
          payloads.push({
            [tKey]: input.title,
            [courseTypeKeyPrimary]: input.courseType,
            [urlKey]: input.liveUrl.trim() || null,
            [publishedKeyPrimary]: input.publishedValue,
          });
        }
        for (const timeKey of liveTimeKeys.slice(0, 1)) {
          payloads.push({
            [tKey]: input.title,
            [courseTypeKeyPrimary]: input.courseType,
            [timeKey]: input.liveTime.trim() || null,
            [publishedKeyPrimary]: input.publishedValue,
          });
        }
      }
    }

    return payloads;
  }

  async function insertCourse(payloads: Array<Record<string, unknown>>) {
    if (!supabase) return { ok: false as const, error: { code: "NO_CLIENT", message: "Supabase client not ready" } };

    let lastError:
      | { code?: string | null; message?: string | null; details?: string | null; hint?: string | null }
      | null = null;
    const missingColumnsTried: string[] = [];

    for (const base of payloads) {
      let payload = base;
      for (let i = 0; i < 10; i += 1) {
        const { error } = await supabase.from("course").insert(payload).select("id");
        if (!error) return { ok: true as const };

        lastError = error;
        const missing = extractMissingColumn(error);
        if (missing) {
          if (!missingColumnsTried.includes(missing)) missingColumnsTried.push(missing);
        } else {
          break;
        }
        if (isProtectedColumnKey(missing)) break;

        const next = removeKey(payload, missing);
        if (next === payload) break;
        payload = next;
      }
    }

    const finalError: { code?: string | null; message?: string | null; details?: string | null; hint?: string | null } =
      lastError ?? { code: "UNKNOWN", message: "Unknown insert error" };
    const details = finalError.details ?? "";
    const extra = missingColumnsTried.length ? `missingColumnsTried: ${missingColumnsTried.join(", ")}` : "";
    return {
      ok: false as const,
      error: {
        ...finalError,
        details: [details, extra].filter(Boolean).join("\n"),
      },
    };
  }

  async function updateCourse(courseId: string, payloads: Array<Record<string, unknown>>) {
    if (!supabase) return { ok: false as const, error: { code: "NO_CLIENT", message: "Supabase client not ready" } };

    const idKeys = ["id", "course_id", "courseId", "courseid", "uuid", "_id"];
    let lastError:
      | { code?: string | null; message?: string | null; details?: string | null; hint?: string | null }
      | null = null;

    for (const idKey of idKeys) {
      for (const base of payloads) {
        let payload = base;
        for (let i = 0; i < 10; i += 1) {
          const { data, error } = await supabase.from("course").update(payload).eq(idKey, courseId).select("id");
          if (!error) {
            if (Array.isArray(data) && data.length > 0) return { ok: true as const };
            lastError = { code: "NO_ROWS", message: "No rows updated" };
            break;
          }

          lastError = error;
          const missing = extractMissingColumn(error);
          if (!missing) break;

          if (missing === idKey) break;
          if (isProtectedColumnKey(missing)) break;

          const next = removeKey(payload, missing);
          if (next === payload) break;
          payload = next;
        }
      }
    }

    return { ok: false as const, error: lastError ?? { code: "UNKNOWN", message: "Unknown update error" } };
  }

  function pickString(row: CourseDbRow | null | undefined, keys: string[]) {
    if (!row) return "";
    for (const k of keys) {
      const v = row[k];
      if (typeof v === "string" && v.trim()) return v;
    }
    return "";
  }

  function pickBoolean(row: CourseDbRow | null | undefined, keys: string[]) {
    if (!row) return false;
    for (const k of keys) {
      const v = row[k];
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v !== 0;
    }
    return false;
  }

  function pickId(row: CourseDbRow) {
    const direct =
      row.id ??
      row.course_id ??
      row.courseId ??
      row.courseid ??
      row.uuid ??
      row._id;
    if (typeof direct === "string" && direct.trim()) return direct;
    if (typeof direct === "number" && Number.isFinite(direct)) return String(direct);
    const anyIdKey = Object.keys(row).find((k) => k.toLowerCase().endsWith("id"));
    if (anyIdKey) {
      const v = row[anyIdKey];
      if (typeof v === "string" && v.trim()) return v;
      if (typeof v === "number" && Number.isFinite(v)) return String(v);
    }
    return "";
  }

  function mapDbRow(row: CourseDbRow): CourseRow {
    const id = pickId(row);
    const title = pickString(row, ["title", "name", "course_title", "course_name", "courseName"]);
    const description = pickString(row, ["description", "summary", "intro", "brief", "subtitle"]);
    const category = pickString(row, ["category", "course_category", "type", "kind"]);
    const published = pickBoolean(row, ["is_published", "published", "isPublished", "is_publish"]);
    const rawCourseType = pickString(row, ["course_type", "content_type", "CourseType", "type"]);
    const courseType: "video" | "live" =
      rawCourseType.toLowerCase().includes("live") || rawCourseType.includes("直播") ? "live" : "video";
    return {
      id: id || `tmp_${Math.random().toString(16).slice(2)}`,
      title: title || "未命名课程",
      description: description || "—",
      category: category || "专注力课程",
      learners: stableLearners(id || "tmp"),
      published,
      courseType,
      contentUrl: "",
      liveUrl: "",
      liveTime: "",
    };
  }

  function pickLessonCourseId(row: LessonDbRow) {
    const direct = row.course_id ?? row.courseId ?? row.courseid;
    if (typeof direct === "string" && direct.trim()) return direct;
    if (typeof direct === "number" && Number.isFinite(direct)) return String(direct);
    return "";
  }

  function pickLessonId(row: LessonDbRow) {
    const direct = row.id ?? row.lesson_id ?? row.uuid ?? row._id;
    if (typeof direct === "string" && direct.trim()) return direct;
    if (typeof direct === "number" && Number.isFinite(direct)) return String(direct);
    return "";
  }

  function safeJsonParse(value: unknown) {
    if (typeof value !== "string") return null;
    const s = value.trim();
    if (!s) return null;
    try {
      return JSON.parse(s) as unknown;
    } catch {
      return null;
    }
  }

  function coerceBoolean(value: unknown) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const s = value.trim().toLowerCase();
      if (["true", "1", "yes", "y", "on"].includes(s)) return true;
      if (["false", "0", "no", "n", "off"].includes(s)) return false;
    }
    return false;
  }

  function parseMetaFromLesson(lesson: LessonDbRow | null | undefined) {
    if (!lesson) return null;
    const meta = safeJsonParse(lesson.content_url) as
      | null
      | {
          description?: unknown;
          category?: unknown;
          published?: unknown;
          courseType?: unknown;
          liveTime?: unknown;
        };
    const title = pickString(lesson as CourseDbRow, ["title"]) || "";
    return {
      title,
      description: typeof meta?.description === "string" ? meta.description : "",
      category: typeof meta?.category === "string" ? meta.category : "",
      published: coerceBoolean(meta?.published),
      courseType:
        typeof meta?.courseType === "string" && meta.courseType.toLowerCase().includes("live")
          ? ("live" as const)
          : ("video" as const),
      liveTime: typeof meta?.liveTime === "string" ? meta.liveTime : "",
    };
  }

  async function fetchCourses() {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const attemptWithCreatedAt = await supabase
      .from("course")
      .select("*")
      .order("created_at", { ascending: false });

    if (attemptWithCreatedAt.error) {
      const msg = attemptWithCreatedAt.error.message?.toLowerCase?.() ?? "";
      if (msg.includes("created_at")) {
        const fallback = await supabase.from("course").select("*");
        if (fallback.error) {
          console.error("拉取失败:", fallback.error);
          showToast("课程读取失败");
          setLoading(false);
          return;
        }
        const rows = (fallback.data ?? []) as unknown as CourseDbRow[];
        setCourseSampleRows(rows.slice(0, 20));
        inferSchemaFromRows(rows);
        setCourses(rows.map(mapDbRow));
        setLoading(false);
        return;
      }

      console.error("拉取失败:", attemptWithCreatedAt.error);
      showToast("课程读取失败");
      setLoading(false);
      return;
    }

    const rows = (attemptWithCreatedAt.data ?? []) as unknown as CourseDbRow[];
    setCourseSampleRows(rows.slice(0, 20));
    inferSchemaFromRows(rows);
    setCourses(rows.map(mapDbRow));
    setLoading(false);
  }

  useEffect(() => {
    void fetchCourses();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => {
      const hay = `${c.title} ${c.description} ${c.category}`.toLowerCase();
      return hay.includes(q);
    });
  }, [courses, query]);

  function openCreate() {
    setModalMode("create");
    setEditingId(null);
    setFormData(initialState);
    setModalOpen(true);
  }

  async function openEdit(course: CourseRow) {
    setModalMode("edit");
    setEditingId(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      courseType: course.courseType ?? "video",
      contentUrl: "",
      liveUrl: "",
      liveTime: "",
    });
    setModalOpen(true);

    if (!supabase) return;
    if (course.id.startsWith("tmp_")) return;

    const { data, error } = await supabase
      .from("lesson")
      .select("*")
      .eq("course_id", course.id)
      .order("sort_order", { ascending: true })
      .limit(1);
    if (error) return;
    const first = Array.isArray(data) && data.length > 0 ? (data[0] as LessonDbRow) : null;
    if (!first) return;

    const lessonType = pickString(first as unknown as CourseDbRow, [
      "lesson_type",
      "type",
      "content_type",
    ]).toLowerCase();
    const url = pickString(first as unknown as CourseDbRow, ["content_url", "url", "media_url"]);
    const liveTime = pickString(first as unknown as CourseDbRow, ["live_time"]);
    const isLive = lessonType.includes("live");

    setFormData((prev) => ({
      ...prev,
      courseType: isLive ? "live" : "video",
      contentUrl: !isLive ? url : "",
      liveUrl: isLive ? url : "",
      liveTime: liveTime || "",
    }));
  }

  const handleSave = async (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaving) return;
    setIsSaving(true);

    let createdNewCourseId: string | null = null;

    try {
      if (!supabase) throw new Error("NO_CLIENT");
      const sb = supabase as NonNullable<typeof supabase>;

      const { data: userData, error: userError } = await sb.auth.getUser();
      if (userError) throw userError;
      if (!userData?.user) {
        throw new Error("NOT_AUTHENTICATED");
      }

      const titleValue = formData.title || "未命名课程";
      const descriptionValue = formData.description;
      const categoryValue = formData.category;

      const lessonTypeValue = formData.courseType === "live" ? "live" : "video";
      const contentUrlValue =
        formData.courseType === "live" ? formData.liveUrl.trim() : formData.contentUrl.trim();
      const shouldWriteLesson = !!contentUrlValue;

      const parseTimeToIso = (input: string) => {
        const raw = (input || "").trim();
        if (!raw) return null;
        const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
        const d = new Date(normalized);
        if (Number.isNaN(d.getTime())) return null;
        return d.toISOString();
      };

      const publishedValue =
        modalMode === "edit" && editingId
          ? courses.find((c) => c.id === editingId)?.published ?? false
          : false;

      const coursePayload: Record<string, unknown> = {
        title: titleValue,
        description: descriptionValue || null,
        category: categoryValue || null,
        course_type: formData.courseType,
        is_published: publishedValue,
      };

      async function insertCourseWithFallback(payloadBase: Record<string, unknown>) {
        let payload: Record<string, unknown> = {
          ...payloadBase,
          created_at: new Date().toISOString(),
        };

        for (let i = 0; i < 12; i += 1) {
          const { data, error } = await sb.from("course").insert([payload]).select("id");
          if (!error) {
            const id =
              Array.isArray(data) && data.length > 0
                ? ((data[0] as { id?: string | number })?.id ?? "").toString()
                : "";
            if (!id) throw new Error("NO_COURSE_ID");
            return id;
          }

          const missing = extractMissingColumn(error);
          if (!missing) throw error;
          const next = removeKey(payload, missing);
          if (next === payload) throw error;
          payload = next;
          if (Object.keys(payload).length === 0) {
            payload = { created_at: new Date().toISOString() };
          }
        }

        throw new Error("COURSE_INSERT_FAILED");
      }

      async function updateCourseWithFallback(courseId: string, payloadBase: Record<string, unknown>) {
        let payload: Record<string, unknown> = { ...payloadBase };
        for (let i = 0; i < 12; i += 1) {
          if (Object.keys(payload).length === 0) return;
          const { error } = await sb.from("course").update(payload).eq("id", courseId);
          if (!error) return;

          const missing = extractMissingColumn(error);
          if (!missing) throw error;
          const next = removeKey(payload, missing);
          if (next === payload) throw error;
          payload = next;
        }

        throw new Error("COURSE_UPDATE_FAILED");
      }

      async function upsertContentLesson(courseId: string) {
        if (!shouldWriteLesson) return null;
        const liveTimeIso = formData.courseType === "live" ? parseTimeToIso(formData.liveTime) : null;

        const { data: existing, error: loadError } = await sb
          .from("lesson")
          .select("id,lesson_type,sort_order")
          .eq("course_id", courseId)
          .order("sort_order", { ascending: true })
          .limit(1);
        if (loadError) throw loadError;

        const first =
          Array.isArray(existing) && existing.length > 0 ? (existing[0] as LessonDbRow) : null;
        const payload: Record<string, unknown> = {
          course_id: courseId,
          title: "第 1 节：完整课程",
          lesson_type: lessonTypeValue,
          content_url: contentUrlValue,
          sort_order: 1,
          live_time: liveTimeIso,
        };

        if (first?.id) {
          const { error } = await sb.from("lesson").update(payload).eq("id", first.id as string);
          if (error) throw error;
          return (first.id as string).toString();
        }
        const { data, error } = await sb.from("lesson").insert([payload]).select("id");
        if (error) throw error;
        const id =
          Array.isArray(data) && data.length > 0
            ? ((data[0] as { id?: string | number })?.id ?? "").toString()
            : "";
        return id || null;
      }

      let courseId = "";

      if (modalMode === "edit" && editingId) {
        await updateCourseWithFallback(editingId, coursePayload);
        courseId = editingId;
      } else {
        courseId = await insertCourseWithFallback(coursePayload);
        createdNewCourseId = courseId;
      }

      await upsertContentLesson(courseId);

      setModalOpen(false);
      setFormData(initialState);
      void fetchCourses();
      alert("指挥官，课程上架成功！");
    } catch (error) {
      if (createdNewCourseId && supabase) {
        try {
          await supabase.from("lesson").delete().eq("course_id", createdNewCourseId);
          await supabase.from("course").delete().eq("id", createdNewCourseId);
        } catch {
          // ignore cleanup failures (RLS/policy may still block deletes)
        }
      }
      console.error("保存失败的详细原因:", JSON.stringify(error, null, 2));
      if ((error as { message?: string })?.message === "NOT_AUTHENTICATED") {
        alert("当前未登录或登录已失效，请先登录后再保存。");
        return;
      }
      alert(
        `保存失败，报错信息: ${
          (error as { message?: string; details?: string })?.message ||
          (error as { message?: string; details?: string })?.details ||
          "未知错误"
        }`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  async function togglePublish(course: CourseRow) {
    if (!supabase || togglingId) return;
    const next = !course.published;
    setTogglingId(course.id);
    try {
      const sb = supabase as NonNullable<typeof supabase>;
      const { error } = await sb
        .from("course")
        .update({ is_published: next })
        .eq("id", course.id);
      if (error) {
        console.error("course publish update failed:", error);
        showToast("更新失败");
        return;
      }
      setCourses((prev) => prev.map((c) => (c.id === course.id ? { ...c, published: next } : c)));
      showToast(next ? "已上架" : "已下架");
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteCourse(course: CourseRow) {
    if (!supabase) return;
    if (course.id.startsWith("tmp_")) {
      showToast("该课程未绑定真实ID，无法删除");
      return;
    }
    const ok = window.confirm(
      "指挥官，确定要永久删除该课程吗？这会导致该课程及其所有章节数据被彻底清空！",
    );
    if (!ok) return;

    const { error: lessonDeleteError } = await supabase.from("lesson").delete().eq("course_id", course.id);
    if (lessonDeleteError) {
      console.error(`lesson delete failed\n${formatSupabaseError(lessonDeleteError)}`);
      showToast("删除失败");
      return;
    }

    const { error } = await supabase.from("course").delete().eq("id", course.id);
    if (error) {
      console.error(`course delete failed\n${formatSupabaseError(error)}`);
      showToast("删除失败");
      return;
    }
    setCourses((prev) => prev.filter((c) => c.id !== course.id));
    showToast("课程已删除");
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-cyan-500/20 bg-white/[0.03] p-6 backdrop-blur-md shadow-[0_0_30px_rgba(34,211,238,0.15)]">
          <div className="text-sm font-semibold text-white">后台安全验证</div>
          <div className="mt-1 text-xs font-light text-slate-400">
            输入暗号以解锁司令部控制台
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") verify();
            }}
            placeholder="请输入密码"
            className="mt-4 w-full rounded-xl border border-white/10 bg-[#0B1324]/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/10"
          />
          <button
            type="button"
            onClick={verify}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-[0.99] transition-all"
          >
            验证身份
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-[#0A0F1C] text-white">
      <div className="flex min-h-dvh">
        <aside
          className={[
            "sticky top-0 h-dvh shrink-0 bg-[#0A0F1C] border-r border-slate-800/60",
            collapsed ? "w-[84px]" : "w-[264px]",
          ].join(" ")}
        >
          <div className="h-full flex flex-col">
            <div className="px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/15 border border-cyan-400/25 shadow-[0_0_18px_rgba(0,198,255,0.14)]">
                  <BrainCircuit className="h-5 w-5 text-cyan-200" />
                </div>
                {!collapsed ? (
                  <div className="min-w-0">
                    <div className="text-sm font-semibold tracking-tight">
                      火花脑机
                    </div>
                    <div className="text-[11px] text-slate-300/70">
                      基础后台管理
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <nav className="px-3">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const isActive =
                    item.key === "dashboard"
                      ? pathname === "/admin" || pathname === "/admin/dashboard"
                      : item.key === "courses"
                        ? pathname.startsWith("/admin/courses")
                        : item.href
                          ? pathname.startsWith(item.href)
                          : false;
                  const Icon = item.Icon;
                  const content = (
                    <>
                      {isActive ? (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(0,198,255,0.40)]" />
                      ) : null}
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-slate-700/40">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      {!collapsed ? (
                        <span className="truncate">{item.label}</span>
                      ) : null}
                    </>
                  );

                  const className = [
                    "relative w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-cyan-500/10 text-cyan-200"
                      : "text-slate-200/80 hover:bg-white/5",
                  ].join(" ");

                  const href = item.href ?? "/admin";
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => go(href)}
                      onPointerUp={() => go(href)}
                      onTouchEnd={() => go(href)}
                      className={className}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="mt-auto p-4">
              <button
                onClick={() => setCollapsed((v) => !v)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-slate-700/50 py-2 text-xs font-semibold text-slate-200/80 hover:bg-white/10"
              >
                <ChevronsLeft
                  className={[
                    "h-4 w-4 transition-transform",
                    collapsed ? "rotate-180" : "",
                  ].join(" ")}
                />
                {!collapsed ? "收起菜单" : null}
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 bg-[#0A0F1C]/85 backdrop-blur-md border-b border-slate-800/60">
            <div className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white/90">
                  基础后台管理 <span className="text-slate-400">|</span> 课程管理
                </div>
                <div className="mt-1 text-[11px] text-slate-300/70">
                  课程列表、上架状态与内容维护
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300/60" />
                  <input
                    className="h-10 w-[320px] rounded-xl bg-white/5 border border-slate-700/50 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-400/50 focus:outline-none focus:border-cyan-400/40 focus:shadow-[0_0_18px_rgba(0,198,255,0.12)]"
                    placeholder="搜索课程…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <button className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-slate-700/50 hover:bg-white/10">
                  <Bell className="h-5 w-5 text-slate-100/80" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.35)]" />
                </button>

                <button className="flex items-center gap-2 rounded-xl bg-white/5 border border-slate-700/50 px-3 py-2 hover:bg-white/10">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/15 border border-cyan-400/25 shadow-[0_0_16px_rgba(0,198,255,0.12)]">
                    <SlidersHorizontal className="h-4 w-4 text-cyan-200" />
                  </span>
                  <span className="hidden md:block text-sm font-semibold text-slate-100">
                    Admin
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-200/70" />
                </button>
              </div>
            </div>
          </header>

          <main className="px-6 py-6">
            <div className="bg-[#131B2F] border border-slate-700/50 rounded-xl p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="text-xl font-semibold tracking-tight text-white/90">
                    课程管理
                  </div>
                  <div className="mt-1 text-xs text-slate-300/70">
                    当前课程总数：{" "}
                    <span className="text-cyan-200 font-semibold">
                      {courses.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1 md:hidden">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300/60" />
                    <input
                      className="h-11 w-full rounded-xl bg-white/5 border border-slate-700/50 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-400/50 focus:outline-none focus:border-cyan-400/40 focus:shadow-[0_0_18px_rgba(0,198,255,0.12)]"
                      placeholder="搜索课程…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={openCreate}
                    className="h-11 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] px-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,198,255,0.18)] inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> 新建课程
                  </button>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-slate-700/50">
                <table className="w-full">
                  <thead className="bg-[#0f172a]">
                    <tr className="text-left text-cyan-400 text-xs">
                      <th className="px-4 py-3 font-semibold">课程信息</th>
                      <th className="px-4 py-3 font-semibold">课程分类</th>
                      <th className="px-4 py-3 font-semibold">学习人数</th>
                      <th className="px-4 py-3 font-semibold">状态</th>
                      <th className="px-4 py-3 font-semibold text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/12 border border-cyan-400/25 text-cyan-200 shadow-[0_0_14px_rgba(0,198,255,0.10)]">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-white/90">
                                {c.title}
                              </div>
                              <div className="mt-1 truncate text-[11px] text-slate-300/70">
                                {c.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Tag>{c.category}</Tag>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-100/80">
                          {c.learners.toLocaleString("zh-CN")}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge published={c.published} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-3 text-xs">
                            <button
                              onClick={() => void openEdit(c)}
                              className="inline-flex items-center gap-1 text-cyan-200/80 hover:text-cyan-200"
                            >
                              <PencilLine className="h-4 w-4" />
                              编辑
                            </button>
                            <button className="text-slate-200/70 hover:text-slate-100">
                              章节管理
                            </button>
                            <button
                              onClick={() => void togglePublish(c)}
                              disabled={togglingId === c.id}
                              className={[
                                c.published
                                  ? "text-slate-200/70 hover:text-slate-100"
                                  : "text-cyan-200/80 hover:text-cyan-200",
                                togglingId === c.id ? "opacity-60" : "",
                              ].join(" ")}
                            >
                              {togglingId === c.id
                                ? "处理中..."
                                : c.published
                                  ? "下架"
                                  : "上架"}
                            </button>
                            <button
                              onClick={() => void deleteCourse(c)}
                              className="inline-flex items-center gap-1 text-red-400/80 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-sm text-slate-300/70"
                        >
                          {loading ? "加载中..." : "暂无匹配课程"}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        isSaving={isSaving}
      />

      {toast ? (
        <div className="fixed right-4 bottom-6 z-[80] rounded-full px-3 py-1 text-[11px] font-medium bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
