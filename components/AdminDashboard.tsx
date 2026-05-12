"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bell,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  FolderTree,
  LayoutDashboard,
  Search,
  Settings,
  SlidersHorizontal,
  Shield,
  Users,
  BookOpen,
  Tags,
  Database,
  PlugZap,
  UploadCloud,
  PencilLine,
  PlusSquare,
  LibraryBig,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
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

const menuItems: Array<{ key: MenuKey; label: string; Icon: React.ElementType; href?: string }> =
  [
    { key: "dashboard", label: "仪表盘", Icon: LayoutDashboard, href: "/admin" },
    { key: "users", label: "用户管理", Icon: Users },
    { key: "courses", label: "课程管理", Icon: BookOpen, href: "/admin/courses" },
    { key: "categories", label: "内容分类", Icon: Tags },
    { key: "data", label: "数据中心", Icon: Database },
    { key: "private", label: "私域配置", Icon: PlugZap },
    { key: "home", label: "首页配置", Icon: SlidersHorizontal },
    { key: "system", label: "系统设置", Icon: Settings },
  ];

function StatCard({
  title,
  value,
  delta,
  Icon,
  accent,
}: {
  title: string;
  value: string;
  delta: string;
  Icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="bg-[#131B2F] border border-slate-700/50 rounded-xl p-4 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl opacity-35" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-4 relative">
        <div className="min-w-0">
          <div className="text-xs text-slate-300/80">{title}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</div>
          <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
            {delta} <span className="text-emerald-300">↑</span>
          </div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-slate-700/40 text-cyan-200 shadow-[0_0_16px_rgba(0,198,255,0.12)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={[
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
        enabled ? "bg-cyan-500" : "bg-slate-700",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          enabled ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#131B2F] border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white/90">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-slate-300/70">{subtitle}</div> : null}
        </div>
        <button className="inline-flex items-center gap-1 rounded-lg bg-white/5 border border-slate-700/50 px-2 py-1 text-[11px] text-slate-200/80">
          近7天 <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-4 h-56">{children}</div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-white/10">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_14px_rgba(0,198,255,0.18)]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export default function AdminDashboard() {
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
    if (password === "admin888") {
      try {
        localStorage.setItem("huohua_admin", "true");
      } catch {}
      setIsAuthenticated(true);
      setPassword("");
      return;
    }
    window.alert("指挥官身份核验失败");
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

  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);

  const [active, setActive] = useState<MenuKey>("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  type PrivateEntryDbRow = Record<string, unknown>;
  type PrivateEntryRow = {
    id: string;
    key: string;
    title: string;
    desc: string;
    iconName: string;
    isActive: boolean;
    sortOrder: number;
  };

  const defaultPrivateEntries: PrivateEntryRow[] = [
    { id: "teacher", key: "teacher", title: "联系老师", desc: "专属答疑", iconName: "Users", isActive: true, sortOrder: 1 },
    { id: "support", key: "support", title: "客服入口", desc: "7×12在线", iconName: "SlidersHorizontal", isActive: true, sortOrder: 2 },
    { id: "wecom", key: "wecom", title: "企微入口", desc: "添加企微", iconName: "PlugZap", isActive: true, sortOrder: 3 },
    { id: "group", key: "group", title: "学习群", desc: "进群提醒", iconName: "Tags", isActive: true, sortOrder: 4 },
    { id: "materials", key: "materials", title: "学习资料", desc: "资料领取", iconName: "UploadCloud", isActive: true, sortOrder: 5 },
    { id: "consult", key: "consult", title: "预约咨询", desc: "1v1评估", iconName: "PencilLine", isActive: true, sortOrder: 6 },
  ];

  const [privateEntries, setPrivateEntries] = useState<PrivateEntryRow[]>(defaultPrivateEntries);
  const [privateLoading, setPrivateLoading] = useState(true);
  const [privateSavingId, setPrivateSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1600);
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

  function pickString(row: PrivateEntryDbRow, keys: string[]) {
    for (const k of keys) {
      const v = row[k];
      if (typeof v === "string" && v.trim()) return v;
    }
    return "";
  }

  function pickBoolean(row: PrivateEntryDbRow, keys: string[]) {
    for (const k of keys) {
      const v = row[k];
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v !== 0;
    }
    return false;
  }

  function pickNumber(row: PrivateEntryDbRow, keys: string[]) {
    for (const k of keys) {
      const v = row[k];
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string") {
        const n = Number(v);
        if (Number.isFinite(n)) return n;
      }
    }
    return 0;
  }

  function pickId(row: PrivateEntryDbRow) {
    const direct = row.id ?? row.uuid ?? row._id ?? row.entry_id ?? row.entryId;
    if (typeof direct === "string" && direct.trim()) return direct;
    return "";
  }

  function mapPrivateEntry(row: PrivateEntryDbRow): PrivateEntryRow {
    const id = pickId(row) || `tmp_${Math.random().toString(16).slice(2)}`;
    const key = pickString(row, ["key", "entry_key", "entryKey", "code", "slug"]);
    const title = pickString(row, ["title", "name", "label"]);
    const desc = pickString(row, ["desc", "description", "subtitle", "hint"]);
    const iconName = pickString(row, ["icon_name", "iconName", "icon"]);
    const isActive = pickBoolean(row, ["is_active", "active", "enabled", "isEnabled"]);
    const sortOrder = pickNumber(row, ["sort_order", "sortOrder", "order"]);
    return {
      id,
      key: key || id,
      title: title || "未命名入口",
      desc: desc || "—",
      iconName: iconName || "PlugZap",
      isActive,
      sortOrder,
    };
  }

  function isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  function resolveIcon(name: string) {
    const Icon = (LucideIcons as unknown as Record<string, unknown>)[name];
    if (typeof Icon === "function") return Icon as React.ElementType;
    return PlugZap;
  }

  async function loadPrivateEntries() {
    if (!supabase) {
      setPrivateLoading(false);
      return;
    }

    setPrivateLoading(true);
    const { data, error } = await supabase
      .from("private_entry")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("拉取私域配置失败:", error);
      const msg = (error.message ?? "").toLowerCase();
      if (msg.includes("sort_order")) {
        const fallback = await supabase.from("private_entry").select("*");
        if (fallback.error) {
          console.error("拉取私域配置失败:", fallback.error);
          setPrivateLoading(false);
          return;
        }
        const rows = (fallback.data ?? []) as unknown as PrivateEntryDbRow[];
        if (rows.length > 0) {
          setPrivateEntries(rows.map(mapPrivateEntry).sort((a, b) => a.sortOrder - b.sortOrder));
        }
        setPrivateLoading(false);
        return;
      }

      setPrivateLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as PrivateEntryDbRow[];
    if (rows.length > 0) {
      setPrivateEntries(rows.map(mapPrivateEntry));
    }
    setPrivateLoading(false);
  }

  useEffect(() => {
    void loadPrivateEntries();
  }, [supabase]);

  async function togglePrivateEntry(entry: PrivateEntryRow) {
    if (privateSavingId) return;
    const next = !entry.isActive;
    setPrivateEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, isActive: next } : e)));

    if (!supabase || !isUuid(entry.id)) {
      showToast("本地预览：未同步到数据库");
      return;
    }

    setPrivateSavingId(entry.id);
    try {
      const { data, error } = await supabase
        .from("private_entry")
        .update({ is_active: next })
        .eq("id", entry.id)
        .select("id");
      if (error) {
        setPrivateEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, isActive: !next } : e)));
        console.error("更新私域配置失败:", error);
        console.error(`更新私域配置失败(格式化)\n${formatSupabaseError(error)}`);
        showToast("保存失败");
        return;
      }
      if (Array.isArray(data) && data.length === 0) {
        setPrivateEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, isActive: !next } : e)));
        console.error("更新私域配置失败: 未命中任何行", { id: entry.id });
        showToast("保存失败");
        return;
      }
      showToast("配置已保存");
    } catch (e) {
      setPrivateEntries((prev) => prev.map((r) => (r.id === entry.id ? { ...r, isActive: !next } : r)));
      console.error("更新私域配置失败(异常):", e);
      showToast("保存失败");
    } finally {
      setPrivateSavingId(null);
    }
  }

  const activeTrend = useMemo(
    () => [
      { day: "周一", active: 1200, newUsers: 260 },
      { day: "周二", active: 1480, newUsers: 320 },
      { day: "周三", active: 1720, newUsers: 410 },
      { day: "周四", active: 1610, newUsers: 380 },
      { day: "周五", active: 1980, newUsers: 460 },
      { day: "周六", active: 2320, newUsers: 520 },
      { day: "周日", active: 2040, newUsers: 490 },
    ],
    [],
  );

  const trainingPie = useMemo(
    () => [
      { name: "专注力训练", value: 40.1, color: "#22d3ee" },
      { name: "节律训练", value: 24.6, color: "#3b82f6" },
      { name: "呼吸训练", value: 18.9, color: "#6366f1" },
      { name: "综合训练", value: 16.4, color: "#14b8a6" },
    ],
    [],
  );

  const checkinBars = useMemo(
    () => [
      { day: "周一", value: 1800 },
      { day: "周二", value: 1400 },
      { day: "周三", value: 2100 },
      { day: "周四", value: 1950 },
      { day: "周五", value: 2400 },
      { day: "周六", value: 3100 },
      { day: "周日", value: 2600 },
    ],
    [],
  );

  const usersTable = useMemo(
    () => [
      {
        name: "小宇",
        stage: "初阶",
        lastActive: "2分钟前",
        progress: 68,
        status: "学习中",
      },
      {
        name: "安然",
        stage: "进阶",
        lastActive: "12分钟前",
        progress: 42,
        status: "学习中",
      },
      {
        name: "小北",
        stage: "初阶",
        lastActive: "1小时前",
        progress: 86,
        status: "学习中",
      },
      {
        name: "Rina",
        stage: "中阶",
        lastActive: "3小时前",
        progress: 31,
        status: "学习中",
      },
      {
        name: "Jason",
        stage: "中阶",
        lastActive: "昨天",
        progress: 55,
        status: "学习中",
      },
    ],
    [],
  );

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
                  const isRoutedActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : item.href === "/admin/courses"
                        ? pathname.startsWith("/admin/courses")
                        : false;
                  const isActive = item.href ? isRoutedActive : active === item.key;
                  const Icon = item.Icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        if (item.href) {
                          router.push(item.href);
                          return;
                        }
                        setActive(item.key);
                      }}
                      className={[
                        "relative w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-cyan-500/10 text-cyan-200"
                          : "text-slate-200/80 hover:bg-white/5",
                      ].join(" ")}
                    >
                      {isActive ? (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(0,198,255,0.40)]" />
                      ) : null}
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-slate-700/40">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      {!collapsed ? (
                        <span className="truncate">{item.label}</span>
                      ) : null}
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
                <ChevronsLeft className={["h-4 w-4 transition-transform", collapsed ? "rotate-180" : ""].join(" ")} />
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
                  基础后台管理 <span className="text-slate-400">|</span> 仪表盘
                </div>
                <div className="mt-1 text-[11px] text-slate-300/70">
                  数据概览与核心业务配置
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300/60" />
                  <input
                    className="h-10 w-[320px] rounded-xl bg-white/5 border border-slate-700/50 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-400/50 focus:outline-none focus:border-cyan-400/40 focus:shadow-[0_0_18px_rgba(0,198,255,0.12)]"
                    placeholder="搜索用户、课程、配置…"
                  />
                </div>

                <button className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-slate-700/50 hover:bg-white/10">
                  <Bell className="h-5 w-5 text-slate-100/80" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.35)]" />
                </button>

                <button className="flex items-center gap-2 rounded-xl bg-white/5 border border-slate-700/50 px-3 py-2 hover:bg-white/10">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/15 border border-cyan-400/25 shadow-[0_0_16px_rgba(0,198,255,0.12)]">
                    <Shield className="h-4 w-4 text-cyan-200" />
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
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="总用户数"
                value="18,639"
                delta="+8.6%"
                Icon={Users}
                accent="rgba(0,198,255,0.55)"
              />
              <StatCard
                title="今日活跃"
                value="3,248"
                delta="+12.1%"
                Icon={LayoutDashboard}
                accent="rgba(59,130,246,0.55)"
              />
              <StatCard
                title="训练完成率"
                value="68.4%"
                delta="+1.7%"
                Icon={FolderTree}
                accent="rgba(99,102,241,0.55)"
              />
              <StatCard
                title="今日打卡数"
                value="2,147"
                delta="+5.4%"
                Icon={Database}
                accent="rgba(20,184,166,0.55)"
              />
            </section>

            <section className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
              <ChartCard title="用户活跃趋势" subtitle="活跃 / 新增（平滑趋势）">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeTrend} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="activeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="newFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fill: "rgba(226,232,240,0.55)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(226,232,240,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(19,27,47,0.98)",
                        border: "1px solid rgba(148,163,184,0.22)",
                        borderRadius: 12,
                        color: "rgba(226,232,240,0.9)",
                      }}
                      labelStyle={{ color: "rgba(226,232,240,0.65)" }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ color: "rgba(226,232,240,0.65)", fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="active" name="活跃" stroke="#22d3ee" strokeWidth={2} fill="url(#activeFill)" />
                    <Area type="monotone" dataKey="newUsers" name="新增" stroke="#3b82f6" strokeWidth={2} fill="url(#newFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="训练数据概览" subtitle="训练类型占比（环形图）">
                <div className="grid grid-cols-5 gap-3 h-full">
                  <div className="col-span-3 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          contentStyle={{
                            background: "rgba(19,27,47,0.98)",
                            border: "1px solid rgba(148,163,184,0.22)",
                            borderRadius: 12,
                            color: "rgba(226,232,240,0.9)",
                          }}
                        />
                        <Pie
                          data={trainingPie}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={52}
                          outerRadius={78}
                          paddingAngle={3}
                        >
                          {trainingPie.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="col-span-2 flex flex-col justify-center gap-2">
                    {trainingPie.map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 border border-slate-700/50 px-2 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                          <span className="truncate text-[11px] text-slate-200/80">{item.name}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-100">{item.value.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>

              <ChartCard title="每日打卡趋势" subtitle="打卡数（柱状图）">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={checkinBars} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fill: "rgba(226,232,240,0.55)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(226,232,240,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(19,27,47,0.98)",
                        border: "1px solid rgba(148,163,184,0.22)",
                        borderRadius: 12,
                        color: "rgba(226,232,240,0.9)",
                      }}
                      labelStyle={{ color: "rgba(226,232,240,0.65)" }}
                    />
                    <Bar dataKey="value" name="打卡" radius={[10, 10, 4, 4]} fill="#22d3ee" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>

            <section className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#131B2F] border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white/90">用户概览</div>
                    <button className="inline-flex items-center gap-1 text-xs text-cyan-200/80 hover:text-cyan-200">
                      查看全部 <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-700/50">
                    <div className="grid grid-cols-12 bg-white/5 px-3 py-2 text-[11px] text-slate-200/70">
                      <div className="col-span-3">用户名</div>
                      <div className="col-span-2">学习阶段</div>
                      <div className="col-span-2">最近活跃</div>
                      <div className="col-span-3">课程进度</div>
                      <div className="col-span-1">状态</div>
                      <div className="col-span-1 text-right">操作</div>
                    </div>
                    <div className="divide-y divide-slate-700/50">
                      {usersTable.map((u) => (
                        <div key={u.name} className="grid grid-cols-12 items-center px-3 py-3 text-[12px] text-slate-100/85">
                          <div className="col-span-3 flex items-center gap-2 min-w-0">
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-200">
                              <Users className="h-4 w-4" />
                            </span>
                            <span className="truncate font-medium">{u.name}</span>
                          </div>
                          <div className="col-span-2 text-slate-200/70">{u.stage}</div>
                          <div className="col-span-2 text-slate-200/70">{u.lastActive}</div>
                          <div className="col-span-3">
                            <ProgressBar value={u.progress} />
                          </div>
                          <div className="col-span-1">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.22)]" />
                              {u.status}
                            </span>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <button className="rounded-lg bg-white/5 border border-slate-700/50 px-2 py-1 text-[11px] text-slate-100/80 hover:bg-white/10">
                              查看
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#131B2F] border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white/90">课程管理</div>
                    <div className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-slate-700/50 px-2 py-1 text-[11px] text-slate-200/80">
                      <FolderTree className="h-3.5 w-3.5" />
                      快捷操作
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push("/admin/courses")}
                      className="rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border border-blue-500/25 p-4 text-left shadow-[0_0_18px_rgba(59,130,246,0.10)] hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-cyan-200">
                          <UploadCloud className="h-5 w-5" />
                        </span>
                        <div className="text-sm font-semibold text-white/90">上传课程</div>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-200/60">快速导入资源</div>
                    </button>
                    <button
                      onClick={() => router.push("/admin/courses")}
                      className="rounded-xl bg-gradient-to-br from-indigo-600/20 to-blue-600/10 border border-indigo-500/25 p-4 text-left shadow-[0_0_18px_rgba(99,102,241,0.10)] hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-cyan-200">
                          <PencilLine className="h-5 w-5" />
                        </span>
                        <div className="text-sm font-semibold text-white/90">编辑内容</div>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-200/60">更新章节与素材</div>
                    </button>
                    <button
                      onClick={() => router.push("/admin/courses")}
                      className="rounded-xl bg-gradient-to-br from-cyan-600/20 to-emerald-600/10 border border-cyan-500/25 p-4 text-left shadow-[0_0_18px_rgba(34,211,238,0.10)] hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-cyan-200">
                          <PlusSquare className="h-5 w-5" />
                        </span>
                        <div className="text-sm font-semibold text-white/90">新建章节</div>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-200/60">结构化内容管理</div>
                    </button>
                    <button
                      onClick={() => router.push("/admin/courses")}
                      className="rounded-xl bg-gradient-to-br from-slate-700/25 to-blue-700/10 border border-slate-500/30 p-4 text-left shadow-[0_0_18px_rgba(148,163,184,0.08)] hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-cyan-200">
                          <LibraryBig className="h-5 w-5" />
                        </span>
                        <div className="text-sm font-semibold text-white/90">课程库</div>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-200/60">查看全部课程</div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#131B2F] border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white/90">私域转化入口配置</div>
                  <button className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-slate-700/50 px-2 py-1 text-[11px] text-slate-200/80">
                    <PlugZap className="h-3.5 w-3.5 text-cyan-200/90" />
                    全部开启
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  {privateLoading ? (
                    <div className="rounded-xl bg-white/5 border border-slate-700/50 p-3 text-[11px] text-slate-200/60">
                      正在同步配置...
                    </div>
                  ) : null}
                  {privateEntries.map((item) => {
                    const Icon = resolveIcon(item.iconName);
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl bg-white/5 border border-slate-700/50 p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/12 border border-cyan-400/25 text-cyan-200 shadow-[0_0_14px_rgba(0,198,255,0.10)]">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white/90 truncate">{item.title}</div>
                            <div className="mt-0.5 text-[11px] text-slate-200/60 truncate">{item.desc}</div>
                          </div>
                        </div>
                        <Toggle enabled={item.isActive} onToggle={() => void togglePrivateEntry(item)} />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-xl bg-white/5 border border-slate-700/50 p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-200/70">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 border border-slate-700/50">
                      <Shield className="h-4 w-4 text-cyan-200/90" />
                    </span>
                    当前配置已生效
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 px-3 py-2 text-xs font-semibold text-cyan-200 shadow-[0_0_16px_rgba(0,198,255,0.12)] hover:bg-cyan-500/20">
                    <SlidersHorizontal className="h-4 w-4" />
                    保存配置
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
      {toast ? (
        <div className="fixed left-1/2 top-6 z-[80] -translate-x-1/2 rounded-full bg-black/60 border border-white/10 px-4 py-2 text-xs text-white/85 backdrop-blur-md">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
