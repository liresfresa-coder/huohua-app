"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
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
  Clock,
} from "lucide-react";

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
    { key: "users", label: "用户管理", Icon: Users, href: "/admin/users" },
    { key: "courses", label: "课程管理", Icon: BookOpen, href: "/admin/courses" },
    { key: "categories", label: "内容分类", Icon: Tags, href: "/admin/categories" },
    { key: "data", label: "数据中心", Icon: Database, href: "/admin/data" },
    { key: "private", label: "私域配置", Icon: PlugZap, href: "/admin/private" },
    { key: "home", label: "首页配置", Icon: SlidersHorizontal, href: "/admin/home" },
    { key: "system", label: "系统设置", Icon: Settings, href: "/admin/system" },
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

function ChartPlaceholder({ hint }: { hint: string }) {
  return (
    <div
      className="h-[280px] rounded-xl bg-[#0B1324]/75 border border-slate-700/50 flex items-center justify-center text-center px-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(148,163,184,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.10) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }}
    >
      <div className="text-xs text-slate-200/60">
        数据图表接驳中
        <div className="mt-2 text-[11px] text-slate-300/50">{hint}</div>
      </div>
    </div>
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

function SectionCard({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="bg-[#131B2F] border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white/90">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-slate-300/70">{subtitle}</div> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
      <div className="md:col-span-4">
        <div className="text-sm font-semibold text-white/90">{label}</div>
        {hint ? <div className="mt-1 text-[11px] text-slate-300/70">{hint}</div> : null}
      </div>
      <div className="md:col-span-8">{children}</div>
    </div>
  );
}

export default function AdminDashboard({ forcedKey }: { forcedKey?: MenuKey }) {
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

  const router = useRouter();
  const pathname = usePathname();
  const navTapGuardRef = useRef(0);
  const [clientPathname, setClientPathname] = useState<string | null>(null);
  const [viewKey, setViewKey] = useState<MenuKey>(forcedKey ?? "dashboard");

  useEffect(() => {
    try {
      setClientPathname(window.location.pathname);
    } catch {
      setClientPathname(null);
    }
  }, [pathname]);
  const [collapsed, setCollapsed] = useState(false);
  const activeKey = useMemo<MenuKey>(() => {
    const p = (clientPathname ?? pathname ?? "").replace(/\/+$/, "") || "/admin";
    if (p === "/admin" || p === "/admin/dashboard") return "dashboard";
    if (p.startsWith("/admin/users")) return "users";
    if (p.startsWith("/admin/courses")) return "courses";
    if (p.startsWith("/admin/categories")) return "categories";
    if (p.startsWith("/admin/data")) return "data";
    if (p.startsWith("/admin/private")) return "private";
    if (p.startsWith("/admin/home")) return "home";
    if (p.startsWith("/admin/system")) return "system";
    return "dashboard";
  }, [clientPathname, pathname]);

  useEffect(() => {
    setViewKey(forcedKey ?? activeKey);
  }, [forcedKey, activeKey]);

  function go(href: string) {
    const now = Date.now();
    if (now - navTapGuardRef.current < 450) return;
    navTapGuardRef.current = now;
    router.push(href);
  }

  type PrivateEntryRow = {
    id: string;
    key: string;
    title: string;
    desc: string;
    Icon: React.ElementType;
    isActive: boolean;
    sortOrder: number;
  };

  const defaultPrivateEntries: PrivateEntryRow[] = [
    { id: "teacher", key: "teacher", title: "联系老师", desc: "专属答疑", Icon: Users, isActive: true, sortOrder: 1 },
    { id: "support", key: "support", title: "客服入口", desc: "7×12在线", Icon: Shield, isActive: true, sortOrder: 2 },
    { id: "wecom", key: "wecom", title: "企微入口", desc: "添加企微", Icon: PlugZap, isActive: true, sortOrder: 3 },
    { id: "group", key: "group", title: "学习群", desc: "自动拉群", Icon: Tags, isActive: true, sortOrder: 4 },
    { id: "materials", key: "materials", title: "学习资料", desc: "资料领取", Icon: UploadCloud, isActive: true, sortOrder: 5 },
    { id: "ops", key: "ops", title: "运营工具", desc: "活动组件", Icon: SlidersHorizontal, isActive: true, sortOrder: 6 },
  ];

  const [privateEntries, setPrivateEntries] = useState<PrivateEntryRow[]>(defaultPrivateEntries);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1600);
  }

  const headerMeta = useMemo(() => {
    const map: Record<MenuKey, { title: string; subtitle: string }> = {
      dashboard: { title: "仪表盘", subtitle: "数据概览与核心业务配置" },
      users: { title: "用户管理", subtitle: "账号、权限与状态管理" },
      courses: { title: "课程管理", subtitle: "课程列表、上架状态与内容维护" },
      categories: { title: "内容分类", subtitle: "分类体系与运营标签管理" },
      data: { title: "数据中心", subtitle: "核心指标、趋势与报表导出" },
      private: { title: "私域配置", subtitle: "客服入口、自动拉群与承接链路" },
      home: { title: "首页配置", subtitle: "推荐位、Banner 与运营模块开关" },
      system: { title: "系统设置", subtitle: "开关、审计与系统级配置" },
    };
    return map[viewKey] ?? map.dashboard;
  }, [viewKey]);

  const [userSearch, setUserSearch] = useState("");
  const [userStatus, setUserStatus] = useState<"all" | "normal" | "banned">("all");
  const [userStage, setUserStage] = useState<"all" | "初阶" | "中阶" | "高阶">("all");
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryStatus, setCategoryStatus] = useState<"all" | "enabled" | "disabled">("all");

  const [privateConfig, setPrivateConfig] = useState({
    serviceWechat: "Teacher_001",
    officialAccount: "火花脑机",
    autoGroup: true,
    groupQrName: "group_qr.png",
  });

  const [homeConfig, setHomeConfig] = useState({
    bannerTitle: "专注当下，持续进步 ✨",
    featuredTag: "本周必修",
    enableFeatured: true,
  });

  const [systemConfig, setSystemConfig] = useState({
    maintenance: false,
    allowSignup: true,
    auditLogs: true,
  });

  const mockUsers = useMemo(
    () => [
      {
        id: "u_001",
        nickname: "脑波冲浪者",
        phone: "138****5678",
        stage: "高阶" as const,
        checkinDays: 128,
        focusHours: 340,
        registeredAt: "2026-04-03 09:41",
        lastActive: "2 小时前",
        status: "normal" as const,
      },
      {
        id: "u_002",
        nickname: "心流刺客",
        phone: "186****1029",
        stage: "中阶" as const,
        checkinDays: 45,
        focusHours: 90,
        registeredAt: "2026-05-01 21:08",
        lastActive: "昨天",
        status: "normal" as const,
      },
      {
        id: "u_003",
        nickname: "赛博冥想家",
        phone: "137****6602",
        stage: "初阶" as const,
        checkinDays: 3,
        focusHours: 2,
        registeredAt: "2026-05-10 14:33",
        lastActive: "18 分钟前",
        status: "banned" as const,
      },
      {
        id: "u_004",
        nickname: "极客先锋",
        phone: "155****3190",
        stage: "中阶" as const,
        checkinDays: 62,
        focusHours: 168,
        registeredAt: "2026-04-22 19:47",
        lastActive: "3 分钟前",
        status: "normal" as const,
      },
      {
        id: "u_005",
        nickname: "AIGC探索者",
        phone: "189****4401",
        stage: "高阶" as const,
        checkinDays: 96,
        focusHours: 210,
        registeredAt: "2026-03-28 10:15",
        lastActive: "昨天 23:12",
        status: "normal" as const,
      },
      {
        id: "u_006",
        nickname: "数据夜行者",
        phone: "133****8808",
        stage: "初阶" as const,
        checkinDays: 14,
        focusHours: 18,
        registeredAt: "2026-05-02 08:06",
        lastActive: "3 天前",
        status: "normal" as const,
      },
    ],
    [],
  );

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim();
    return mockUsers.filter((u) => {
      const statusOk = userStatus === "all" ? true : u.status === userStatus;
      if (!statusOk) return false;
      const stageOk = userStage === "all" ? true : u.stage === userStage;
      if (!stageOk) return false;
      if (!q) return true;
      return u.nickname.includes(q) || u.phone.includes(q);
    });
  }, [mockUsers, userSearch, userStatus, userStage]);

  const mockCategories = useMemo(
    () => [
      { id: "c_001", name: "专注力课程", courses: 12, updatedAt: "2026-05-12", status: "启用" },
      { id: "c_002", name: "家长课", courses: 6, updatedAt: "2026-05-10", status: "启用" },
      { id: "c_003", name: "学习方法", courses: 9, updatedAt: "2026-05-08", status: "启用" },
      { id: "c_004", name: "情绪管理", courses: 5, updatedAt: "2026-05-06", status: "启用" },
      { id: "c_005", name: "试运行", courses: 2, updatedAt: "2026-04-29", status: "停用" },
    ],
    [],
  );

  const dataCards = useMemo(
    () => [
      { title: "总用户数", value: "18,639", delta: "+8.6%", Icon: Users, accent: "rgba(0,198,255,0.55)" },
      { title: "今日新增", value: "462", delta: "+12.0%", Icon: PlusSquare, accent: "rgba(34,211,238,0.55)" },
      { title: "核心课程数", value: "27", delta: "+3.8%", Icon: BookOpen, accent: "rgba(99,102,241,0.55)" },
      { title: "今日打卡总时长", value: "1,984 分钟", delta: "+9.4%", Icon: Database, accent: "rgba(59,130,246,0.55)" },
    ],
    [],
  );

  function togglePrivateEntry(entry: PrivateEntryRow) {
    setPrivateEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, isActive: !e.isActive } : e)));
    showToast("配置已保存生效");
  }

  const dashboardCards = useMemo(
    () => [
      { title: "总用户数", value: "18,639", delta: "较昨日上涨 8.6%", Icon: Users, accent: "rgba(0,198,255,0.55)" },
      { title: "今日新增", value: "462", delta: "较昨日上涨 12%", Icon: PlusSquare, accent: "rgba(34,211,238,0.55)" },
      { title: "核心课程数", value: "27", delta: "较昨日上涨 3.8%", Icon: BookOpen, accent: "rgba(99,102,241,0.55)" },
      { title: "今日打卡总时长", value: "1,984 分钟", delta: "较昨日上涨 9.4%", Icon: Clock, accent: "rgba(59,130,246,0.55)" },
    ],
    [],
  );

  const dataCenterCards = useMemo(
    () => [
      { title: "DAU", value: "3,248", delta: "较昨日上涨 6.2%", Icon: LayoutDashboard, accent: "rgba(0,198,255,0.55)" },
      { title: "训练完成率", value: "68.4%", delta: "较昨日上涨 1.7%", Icon: Shield, accent: "rgba(34,211,238,0.55)" },
      { title: "复训用户占比", value: "41.8%", delta: "较昨日上涨 2.1%", Icon: Users, accent: "rgba(99,102,241,0.55)" },
      { title: "训练总时长", value: "6,720 分钟", delta: "较昨日上涨 7.9%", Icon: Database, accent: "rgba(59,130,246,0.55)" },
    ],
    [],
  );

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
      { name: "小宇", stage: "初阶", lastActive: "2分钟前", progress: 68, status: "学习中" },
      { name: "安然", stage: "进阶", lastActive: "12分钟前", progress: 42, status: "学习中" },
      { name: "小北", stage: "初阶", lastActive: "1小时前", progress: 86, status: "学习中" },
      { name: "Rina", stage: "中阶", lastActive: "3小时前", progress: 31, status: "学习中" },
      { name: "Jason", stage: "中阶", lastActive: "昨天", progress: 55, status: "学习中" },
    ],
    [],
  );

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
                      ? viewKey === "dashboard"
                      : item.key === "courses"
                        ? viewKey === "courses"
                        : viewKey === item.key;
                  const Icon = item.Icon;
                  const href = item.href ?? "/admin";
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setViewKey(item.key);
                        go(href);
                      }}
                      onPointerUp={() => {
                        setViewKey(item.key);
                        go(href);
                      }}
                      onTouchEnd={() => {
                        setViewKey(item.key);
                        go(href);
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
                  基础后台管理 <span className="text-slate-400">|</span> {headerMeta.title}
                </div>
                <div className="mt-1 text-[11px] text-slate-300/70">
                  {headerMeta.subtitle}
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
            {viewKey === "dashboard" ? (
              <>
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard title="总用户数" value="18,639" delta="较昨日上涨 8.6%" Icon={Users} accent="rgba(0,198,255,0.55)" />
                  <StatCard title="今日活跃" value="3,248" delta="较昨日上涨 12.1%" Icon={LayoutDashboard} accent="rgba(59,130,246,0.55)" />
                  <StatCard title="训练完成率" value="68.4%" delta="较昨日上涨 1.7%" Icon={FolderTree} accent="rgba(99,102,241,0.55)" />
                  <StatCard title="今日打卡数" value="2,147" delta="较昨日上涨 5.4%" Icon={Database} accent="rgba(20,184,166,0.55)" />
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
                        <Legend iconType="circle" wrapperStyle={{ color: "rgba(226,232,240,0.65)", fontSize: 12 }} />
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
                            <Pie data={trainingPie} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3}>
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
                      <button
                        type="button"
                        onClick={() => showToast("功能接驳中")}
                        className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-slate-700/50 px-2 py-1 text-[11px] text-slate-200/80"
                      >
                        <PlugZap className="h-3.5 w-3.5 text-cyan-200/90" />
                        全部开启
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3">
                      {privateEntries.map((item) => {
                        const Icon = item.Icon;
                        return (
                          <div key={item.id} className="rounded-xl bg-white/5 border border-slate-700/50 p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/12 border border-cyan-400/25 text-cyan-200 shadow-[0_0_14px_rgba(0,198,255,0.10)]">
                                <Icon className="h-5 w-5" />
                              </span>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-white/90 truncate">{item.title}</div>
                                <div className="mt-0.5 text-[11px] text-slate-200/60 truncate">{item.desc}</div>
                              </div>
                            </div>
                            <Toggle enabled={item.isActive} onToggle={() => togglePrivateEntry(item)} />
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
                      <button
                        type="button"
                        onClick={() => showToast("配置已保存生效")}
                        className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 px-3 py-2 text-xs font-semibold text-cyan-200 shadow-[0_0_16px_rgba(0,198,255,0.12)] hover:bg-cyan-500/20"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        保存配置
                      </button>
                    </div>
                  </div>
                </section>
              </>
            ) : null}

            {viewKey === "data" ? (
              <>
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {dataCenterCards.map((c) => (
                    <StatCard key={c.title} title={c.title} value={c.value} delta={c.delta} Icon={c.Icon} accent={c.accent} />
                  ))}
                </section>

                <section className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <SectionCard title="核心指标趋势" subtitle="折线图占位区（接驳中）">
                    <ChartPlaceholder hint="DAU / 训练时长 / 完成率趋势接驳中" />
                  </SectionCard>
                  <SectionCard title="渠道转化漏斗" subtitle="柱状图占位区（接驳中）">
                    <ChartPlaceholder hint="渠道漏斗柱状图接驳中" />
                  </SectionCard>
                </section>
              </>
            ) : null}

            {viewKey === "users" ? (
              <SectionCard title="用户管理" subtitle="火花脑机 · 用户档案矩阵（Mock）">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300/60" />
                    <input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="h-10 w-full rounded-xl bg-white/5 border border-slate-700/50 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-400/50 focus:outline-none focus:border-cyan-400/40 focus:shadow-[0_0_18px_rgba(0,198,255,0.12)]"
                      placeholder="输入用户昵称/手机号精确打击..."
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                      value={userStatus}
                      onChange={(e) => setUserStatus(e.target.value as typeof userStatus)}
                      className="h-10 rounded-xl bg-white/5 border border-slate-700/50 px-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/40"
                    >
                      <option className="bg-[#0A0F1C]" value="all">全部状态</option>
                      <option className="bg-[#0A0F1C]" value="normal">正常</option>
                      <option className="bg-[#0A0F1C]" value="banned">封禁</option>
                    </select>

                    <select
                      value={userStage}
                      onChange={(e) => setUserStage(e.target.value as typeof userStage)}
                      className="h-10 rounded-xl bg-white/5 border border-slate-700/50 px-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/40"
                    >
                      <option className="bg-[#0A0F1C]" value="all">全部阶段</option>
                      <option className="bg-[#0A0F1C]" value="初阶">初阶</option>
                      <option className="bg-[#0A0F1C]" value="中阶">中阶</option>
                      <option className="bg-[#0A0F1C]" value="高阶">高阶</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast("导出用户报告任务已创建")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-[0.99] transition-all"
                  >
                    <UploadCloud className="h-4 w-4" />
                    导出用户报告
                  </button>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-slate-700/50">
                  <div className="grid grid-cols-12 bg-white/5 px-3 py-2 text-[11px] text-slate-200/70">
                    <div className="col-span-4">用户信息</div>
                    <div className="col-span-1">训练阶段</div>
                    <div className="col-span-2">肝度指标</div>
                    <div className="col-span-1">最近活跃</div>
                    <div className="col-span-2">注册时间</div>
                    <div className="col-span-1">账号状态</div>
                    <div className="col-span-1 text-right">操作</div>
                  </div>
                  <div className="divide-y divide-slate-700/50">
                    {filteredUsers.map((u) => {
                      const isNormal = u.status === "normal";
                      const stageTone =
                        u.stage === "初阶"
                          ? "bg-cyan-500/12 border-cyan-400/25 text-cyan-200"
                          : u.stage === "中阶"
                            ? "bg-indigo-500/12 border-indigo-400/25 text-indigo-200"
                            : "bg-emerald-500/12 border-emerald-400/25 text-emerald-200";
                      return (
                        <div key={u.id} className="grid grid-cols-12 items-center px-3 py-3 text-[12px] text-slate-100/85">
                          <div className="col-span-4 flex items-center gap-3 min-w-0">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-200 shadow-[0_0_16px_rgba(0,198,255,0.10)]">
                              <span className="text-sm font-semibold">{u.nickname.slice(0, 1)}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-white/90 truncate">{u.nickname}</div>
                              <div className="mt-0.5 text-[11px] text-slate-200/60 truncate">{u.phone}</div>
                            </div>
                          </div>

                          <div className="col-span-1">
                            <span className={["inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold", stageTone].join(" ")}>
                              {u.stage}
                            </span>
                          </div>

                          <div className="col-span-2 text-slate-200/70">
                            {u.checkinDays}天 / {u.focusHours}小时
                          </div>

                          <div className="col-span-1 text-slate-200/70">{u.lastActive}</div>
                          <div className="col-span-2 text-slate-200/70">{u.registeredAt}</div>

                          <div className="col-span-1">
                            <span className={["inline-flex items-center gap-2 text-[11px] font-semibold", isNormal ? "text-emerald-300" : "text-rose-300"].join(" ")}>
                              <span className="relative inline-flex h-2.5 w-2.5">
                                <span
                                  className={[
                                    "absolute inline-flex h-full w-full rounded-full blur-[1px] opacity-60 animate-pulse",
                                    isNormal ? "bg-emerald-400" : "bg-rose-400",
                                  ].join(" ")}
                                />
                                <span
                                  className={[
                                    "relative inline-flex h-2.5 w-2.5 rounded-full",
                                    isNormal
                                      ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.22)]"
                                      : "bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.22)]",
                                  ].join(" ")}
                                />
                              </span>
                              {isNormal ? "正常" : "封禁"}
                            </span>
                          </div>

                          <div className="col-span-1 flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => window.alert("功能接驳中")}
                              className="text-[11px] font-semibold text-cyan-200/90 hover:text-cyan-200"
                            >
                              查看详情
                            </button>
                            <button
                              type="button"
                              onClick={() => window.alert("功能接驳中")}
                              className="text-[11px] font-semibold text-rose-200/90 hover:text-rose-200"
                            >
                              封禁
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SectionCard>
            ) : null}

            {viewKey === "categories" ? (
              <SectionCard
                title="内容分类"
                subtitle="分类体系与运营标签（Mock）"
                right={
                  <button
                    type="button"
                    onClick={() => showToast("新增分类接驳中")}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/15 hover:opacity-90"
                  >
                    <PlusSquare className="h-4 w-4" />
                    新增分类
                  </button>
                }
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300/60" />
                    <input
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="h-10 w-full rounded-xl bg-white/5 border border-slate-700/50 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-400/50 focus:outline-none focus:border-cyan-400/40"
                      placeholder="搜索分类名称"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={categoryStatus}
                      onChange={(e) => setCategoryStatus(e.target.value as typeof categoryStatus)}
                      className="h-10 rounded-xl bg-white/5 border border-slate-700/50 px-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/40"
                    >
                      <option className="bg-[#0A0F1C]" value="all">全部状态</option>
                      <option className="bg-[#0A0F1C]" value="enabled">启用</option>
                      <option className="bg-[#0A0F1C]" value="disabled">停用</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => showToast("导出已就绪")}
                      className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-slate-700/50 px-3 py-2 text-xs font-semibold text-slate-100/80 hover:bg-white/10"
                    >
                      <UploadCloud className="h-4 w-4" />
                      导出
                    </button>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-slate-700/50">
                  <div className="grid grid-cols-12 bg-white/5 px-3 py-2 text-[11px] text-slate-200/70">
                    <div className="col-span-5">分类名称</div>
                    <div className="col-span-2">课程数</div>
                    <div className="col-span-3">更新时间</div>
                    <div className="col-span-1">状态</div>
                    <div className="col-span-1 text-right">操作</div>
                  </div>
                  <div className="divide-y divide-slate-700/50">
                    {mockCategories
                      .filter((c) => {
                        const q = categorySearch.trim();
                        const statusOk =
                          categoryStatus === "all"
                            ? true
                            : categoryStatus === "enabled"
                              ? c.status === "启用"
                              : c.status === "停用";
                        if (!statusOk) return false;
                        if (!q) return true;
                        return c.name.includes(q);
                      })
                      .map((c) => (
                        <div key={c.id} className="grid grid-cols-12 items-center px-3 py-3 text-[12px] text-slate-100/85">
                          <div className="col-span-5 flex items-center gap-2 min-w-0">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/12 border border-indigo-400/20 text-indigo-200">
                              <Tags className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold text-white/90 truncate">{c.name}</div>
                              <div className="mt-0.5 text-[11px] text-slate-200/60 truncate">运营标签与货架分组</div>
                            </div>
                          </div>
                          <div className="col-span-2 text-slate-200/70">{c.courses}</div>
                          <div className="col-span-3 text-slate-200/70">{c.updatedAt}</div>
                          <div className="col-span-1">
                            {c.status === "启用" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                启用
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                                <span className="h-2 w-2 rounded-full bg-slate-400" />
                                停用
                              </span>
                            )}
                          </div>
                          <div className="col-span-1 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => showToast("编辑分类接驳中")}
                              className="rounded-lg bg-white/5 border border-slate-700/50 px-2 py-1 text-[11px] text-slate-100/80 hover:bg-white/10"
                            >
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast("状态已更新")}
                              className="rounded-lg bg-cyan-500/12 border border-cyan-400/25 px-2 py-1 text-[11px] text-cyan-200/90 hover:bg-cyan-500/15"
                            >
                              切换
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </SectionCard>
            ) : null}

            {viewKey === "private" ? (
              <div className="space-y-4">
                <SectionCard title="私域配置" subtitle="左侧标签 + 右侧控件（Mock）">
                  <div className="space-y-4">
                    <FieldRow label="客服微信号" hint="用于引流承接展示">
                      <input
                        value={privateConfig.serviceWechat}
                        onChange={(e) => setPrivateConfig((p) => ({ ...p, serviceWechat: e.target.value }))}
                        className="h-10 w-full rounded-xl bg-white/5 border border-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-400/50 focus:outline-none focus:border-cyan-400/40"
                        placeholder="例如：Teacher_001"
                      />
                    </FieldRow>
                    <FieldRow label="公众号名称" hint="用于统一品牌展示">
                      <input
                        value={privateConfig.officialAccount}
                        onChange={(e) => setPrivateConfig((p) => ({ ...p, officialAccount: e.target.value }))}
                        className="h-10 w-full rounded-xl bg-white/5 border border-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-400/50 focus:outline-none focus:border-cyan-400/40"
                        placeholder="例如：火花脑机"
                      />
                    </FieldRow>
                    <FieldRow label="上传群二维码" hint="MVP：先占位，后续接 Storage">
                      <div className="rounded-xl bg-white/5 border border-slate-700/50 p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white/85 truncate">{privateConfig.groupQrName}</div>
                          <div className="mt-1 text-[11px] text-slate-200/60">支持 JPG/PNG，建议 1:1</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast("上传通道接驳中")}
                          className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-slate-700/50 px-3 py-2 text-xs font-semibold text-slate-100/80 hover:bg-white/10"
                        >
                          <UploadCloud className="h-4 w-4" />
                          上传
                        </button>
                      </div>
                    </FieldRow>
                    <FieldRow label="是否开启自动拉群" hint="开启后将自动引导用户进群">
                      <Toggle enabled={privateConfig.autoGroup} onToggle={() => setPrivateConfig((p) => ({ ...p, autoGroup: !p.autoGroup }))} />
                    </FieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="私域转化入口配置" subtitle="入口开关（Mock）">
                  <div className="grid grid-cols-1 gap-3">
                    {privateEntries.map((item) => {
                      const Icon = item.Icon;
                      return (
                        <div key={item.id} className="rounded-xl bg-white/5 border border-slate-700/50 p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/12 border border-cyan-400/25 text-cyan-200 shadow-[0_0_14px_rgba(0,198,255,0.10)]">
                              <Icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white/90 truncate">{item.title}</div>
                              <div className="mt-0.5 text-[11px] text-slate-200/60 truncate">{item.desc}</div>
                            </div>
                          </div>
                          <Toggle enabled={item.isActive} onToggle={() => togglePrivateEntry(item)} />
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>

                <div className="sticky bottom-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => showToast("配置已保存生效")}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-[0.99] transition-all"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    保存配置
                  </button>
                </div>
              </div>
            ) : null}

            {viewKey === "home" ? (
              <div className="space-y-4">
                <SectionCard title="首页配置" subtitle="推荐位与模块开关（Mock）">
                  <div className="space-y-4">
                    <FieldRow label="Banner 标题" hint="首页顶部推荐区域文案">
                      <input
                        value={homeConfig.bannerTitle}
                        onChange={(e) => setHomeConfig((p) => ({ ...p, bannerTitle: e.target.value }))}
                        className="h-10 w-full rounded-xl bg-white/5 border border-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-400/50 focus:outline-none focus:border-cyan-400/40"
                      />
                    </FieldRow>
                    <FieldRow label="推荐标签" hint="用于运营标记">
                      <input
                        value={homeConfig.featuredTag}
                        onChange={(e) => setHomeConfig((p) => ({ ...p, featuredTag: e.target.value }))}
                        className="h-10 w-full rounded-xl bg-white/5 border border-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-400/50 focus:outline-none focus:border-cyan-400/40"
                      />
                    </FieldRow>
                    <FieldRow label="启用推荐课程模块" hint="关闭后首页隐藏推荐区">
                      <Toggle enabled={homeConfig.enableFeatured} onToggle={() => setHomeConfig((p) => ({ ...p, enableFeatured: !p.enableFeatured }))} />
                    </FieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="模块预览" subtitle="预览接驳中（Mock）">
                  <div className="h-[180px] rounded-xl bg-white/5 border border-slate-700/50 flex items-center justify-center">
                    <div className="text-xs text-slate-200/60">数据图表接驳中</div>
                  </div>
                </SectionCard>

                <div className="sticky bottom-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => showToast("配置已保存生效")}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-[0.99] transition-all"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    保存配置
                  </button>
                </div>
              </div>
            ) : null}

            {viewKey === "system" ? (
              <div className="space-y-4">
                <SectionCard title="系统设置" subtitle="系统级开关与审计（Mock）">
                  <div className="space-y-4">
                    <FieldRow label="维护模式" hint="开启后前台展示维护提示">
                      <Toggle enabled={systemConfig.maintenance} onToggle={() => setSystemConfig((p) => ({ ...p, maintenance: !p.maintenance }))} />
                    </FieldRow>
                    <FieldRow label="开放注册" hint="关闭后仅管理员可新增用户">
                      <Toggle enabled={systemConfig.allowSignup} onToggle={() => setSystemConfig((p) => ({ ...p, allowSignup: !p.allowSignup }))} />
                    </FieldRow>
                    <FieldRow label="审计日志" hint="记录关键操作（Mock）">
                      <Toggle enabled={systemConfig.auditLogs} onToggle={() => setSystemConfig((p) => ({ ...p, auditLogs: !p.auditLogs }))} />
                    </FieldRow>
                  </div>
                </SectionCard>

                <SectionCard title="运行状态" subtitle="系统健康度（Mock）">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/5 border border-slate-700/50 p-4">
                      <div className="text-[11px] text-slate-200/60">数据库</div>
                      <div className="mt-2 text-sm font-semibold text-emerald-300">正常</div>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-slate-700/50 p-4">
                      <div className="text-[11px] text-slate-200/60">对象存储</div>
                      <div className="mt-2 text-sm font-semibold text-emerald-300">正常</div>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-slate-700/50 p-4">
                      <div className="text-[11px] text-slate-200/60">任务队列</div>
                      <div className="mt-2 text-sm font-semibold text-cyan-200">接驳中</div>
                    </div>
                  </div>
                </SectionCard>

                <div className="sticky bottom-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => showToast("配置已保存生效")}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-[0.99] transition-all"
                  >
                    <Settings className="h-4 w-4" />
                    保存配置
                  </button>
                </div>
              </div>
            ) : null}
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
