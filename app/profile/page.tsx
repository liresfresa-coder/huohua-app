"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  ChevronRight,
  Crown,
  GraduationCap,
  Headset,
  LogOut,
  PackageOpen,
  PencilLine,
  ShieldUser,
  User,
  Users,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { getSupabaseClient } from "@/src/lib/supabase";
import { useUser } from "@/context/UserContext";

type ServiceRow = {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  iconWrapClassName: string;
  status: string;
};

type ServiceDbRow = Record<string, unknown>;

const defaultServices: ServiceRow[] = [
  {
    id: "teacher",
    title: "联系老师",
    subtitle: "1对1专属指导，训练更高效",
    iconName: "GraduationCap",
    iconWrapClassName: "bg-blue-500/20 text-blue-400",
    status: "专属老师在线",
  },
  {
    id: "support",
    title: "联系客服",
    subtitle: "问题反馈 / 售后支持",
    iconName: "Headset",
    iconWrapClassName: "bg-indigo-500/20 text-indigo-400",
    status: "24h响应",
  },
  {
    id: "wecom",
    title: "加企微/进群",
    subtitle: "进入训练营社群，领取福利",
    iconName: "Users",
    iconWrapClassName: "bg-cyan-500/20 text-cyan-400",
    status: "福利更新中",
  },
  {
    id: "materials",
    title: "领取资料",
    subtitle: "专注力训练资料包免费领",
    iconName: "PackageOpen",
    iconWrapClassName: "bg-violet-500/20 text-violet-400",
    status: "可领取",
  },
  {
    id: "consult",
    title: "预约咨询",
    subtitle: "评估孩子专注力现状",
    iconName: "CalendarCheck",
    iconWrapClassName: "bg-amber-500/20 text-amber-300",
    status: "可预约",
  },
  {
    id: "account",
    title: "账号信息",
    subtitle: "安全设置 / 账号状态",
    iconName: "ShieldUser",
    iconWrapClassName: "bg-slate-500/20 text-slate-200",
    status: "已登录",
  },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);

  const [services, setServices] = useState<ServiceRow[]>(defaultServices);
  const { nickname, avatar, updateUserInfo, resetUserInfo } = useUser();
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState(nickname);
  const [draftAvatar, setDraftAvatar] = useState<string | null>(avatar);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1600);
  }

  function openEdit() {
    setDraftName(nickname);
    setDraftAvatar(avatar);
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
  }

  async function saveEdit() {
    const nextName = (draftName || "").trim() || "探索者";
    const nextAvatar = draftAvatar;

    let email = "";
    if (supabase) {
      try {
        const { data } = await supabase.auth.getUser();
        email = data.user?.email ?? "";
        const nicknameInMeta = (data.user?.user_metadata as Record<string, unknown> | null)?.nickname;
        const shouldWriteMeta = typeof nicknameInMeta !== "string" || nicknameInMeta.trim() !== nextName;
        if (shouldWriteMeta) {
          await supabase.auth.updateUser({ data: { nickname: nextName } });
        }
      } catch {}
    }

    if (email) {
      try {
        localStorage.setItem(`nickname_${email}`, nextName);
        if (nextAvatar) localStorage.setItem(`avatar_${email}`, nextAvatar);
        else localStorage.removeItem(`avatar_${email}`);
      } catch {}
    }

    updateUserInfo(nextName, nextAvatar);
    setEditOpen(false);
    showToast("资料更新成功");
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      try {
        resetUserInfo();
      } catch {}
      try {
        const keys = Object.keys(localStorage);
        for (const k of keys) {
          if (k.startsWith("sb-") && k.endsWith("-auth-token")) localStorage.removeItem(k);
        }
      } catch {}
      if (supabase) {
        await supabase.auth.signOut();
      }
      showToast("已安全退出");
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function pickString(row: ServiceDbRow, keys: string[]) {
    for (const k of keys) {
      const v = row[k];
      if (typeof v === "string" && v.trim()) return v;
    }
    return "";
  }

  function pickId(row: ServiceDbRow) {
    const direct = row.id ?? row.uuid ?? row._id ?? row.entry_id ?? row.entryId;
    if (typeof direct === "string" && direct.trim()) return direct;
    return "";
  }

  function resolveIcon(name: string) {
    const Icon = (LucideIcons as unknown as Record<string, unknown>)[name];
    if (typeof Icon === "function") return Icon as React.ElementType;
    return User;
  }

  function resolveIconWrapClassName(iconName: string, index: number) {
    const normalized = (iconName || "").toLowerCase();
    if (normalized.includes("headset") || normalized.includes("headphones")) return "bg-indigo-500/20 text-indigo-400";
    if (normalized.includes("calendar") || normalized.includes("clock")) return "bg-amber-500/20 text-amber-300";
    if (normalized.includes("package") || normalized.includes("gift") || normalized.includes("download"))
      return "bg-violet-500/20 text-violet-400";
    if (normalized.includes("users") || normalized.includes("usercheck") || normalized.includes("user-plus"))
      return "bg-cyan-500/20 text-cyan-400";
    if (normalized.includes("shield") || normalized.includes("lock") || normalized.includes("key"))
      return "bg-slate-500/20 text-slate-200";
    if (normalized.includes("graduation") || normalized.includes("school") || normalized.includes("book"))
      return "bg-blue-500/20 text-blue-400";

    const palette = [
      "bg-blue-500/20 text-blue-400",
      "bg-indigo-500/20 text-indigo-400",
      "bg-cyan-500/20 text-cyan-400",
      "bg-violet-500/20 text-violet-400",
      "bg-amber-500/20 text-amber-300",
      "bg-slate-500/20 text-slate-200",
    ];
    return palette[index % palette.length];
  }

  function mapDbRow(row: ServiceDbRow, index: number): ServiceRow {
    const id = pickId(row) || `tmp_${Math.random().toString(16).slice(2)}`;
    const title = pickString(row, ["title", "name", "label"]);
    const subtitle = pickString(row, ["description", "subtitle", "desc", "hint"]);
    const iconName = pickString(row, ["icon_name", "iconName", "icon"]) || "User";
    const status = pickString(row, ["status", "right_tag", "tag", "badge", "badge_text"]) || "在线";
    return {
      id,
      title: title || "未命名服务",
      subtitle: subtitle || "—",
      iconName,
      iconWrapClassName: resolveIconWrapClassName(iconName, index),
      status,
    };
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase) return;

      const { data, error } = await supabase
        .from("private_entry")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (cancelled) return;
      if (error) {
        console.error("拉取私域配置失败:", error);
        return;
      }

      const rows = (data ?? []) as unknown as ServiceDbRow[];
      if (rows.length === 0) return;

      setServices(rows.map(mapDbRow));
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-24">
      <div className="px-4 pt-8">
        <div className="text-2xl font-semibold tracking-tight">个人中心</div>
        <div className="mt-1 text-xs text-gray-400">专注成长，科学训练每一天</div>
      </div>

      <div className="mx-4 mt-6 p-5 rounded-3xl bg-gradient-to-b from-[#0B1A42] to-[#040B22] border border-[#1A2E65] relative overflow-hidden">
        <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <button
            type="button"
            onClick={openEdit}
            className="w-full flex items-center gap-4 cursor-pointer rounded-2xl p-2 -m-2 hover:bg-white/5 transition-all"
          >
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt="头像"
                  className="h-16 w-16 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,198,255,0.18)] object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/25 via-blue-500/15 to-violet-500/25 border border-white/10 shadow-[0_0_30px_rgba(0,198,255,0.18)] grid place-items-center">
                  <User className="h-8 w-8 text-cyan-200 drop-shadow-[0_0_12px_rgba(0,198,255,0.45)]" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-xl font-semibold">{nickname}</div>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 px-2 py-0.5 text-[11px] font-semibold text-cyan-200 shadow-[0_0_14px_rgba(0,198,255,0.22)]">
                  💎 LV.4
                </span>
              </div>
              <div className="mt-1 text-xs text-white/55">今日状态：专注力指数持续上升</div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-200/80 shrink-0">
              <PencilLine className="h-3.5 w-3.5" />
              ✎ 编辑
            </div>
          </button>

          <div className="mt-4 bg-gradient-to-r from-[#172346] to-[#0F172A] rounded-xl p-3 border border-[#2D4587] flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Crown className="h-4 w-4 text-amber-200" />
              <span>👑 专注训练营会员</span>
            </div>
            <div className="text-[11px] text-white/70">有效期至 2025-06-20</div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-[#0A1332]/50 rounded-2xl p-3 flex flex-col items-center justify-center border border-[#1C2D5A]">
              <div className="text-xs text-white/60">我的课程</div>
              <div className="mt-1 text-cyan-400 text-3xl font-bold">18</div>
            </div>
            <div className="bg-[#0A1332]/50 rounded-2xl p-3 flex flex-col items-center justify-center border border-[#1C2D5A]">
              <div className="text-xs text-white/60">训练记录</div>
              <div className="mt-1 text-cyan-400 text-3xl font-bold">68</div>
            </div>
            <div className="bg-[#0A1332]/50 rounded-2xl p-3 flex flex-col items-center justify-center border border-[#1C2D5A]">
              <div className="text-xs text-white/60">打卡记录</div>
              <div className="mt-1 text-cyan-400 text-3xl font-bold">6</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-gray-400 mx-4 mt-6 mb-3 font-medium">我的服务</div>

      <div className="mx-4 bg-[#081027] rounded-3xl p-2 border border-[#121E40] flex flex-col gap-1">
        {services.map((item) => {
          const Icon = resolveIcon(item.iconName);
          return (
            <button
              key={item.id}
              type="button"
              className="w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-white/5 transition-colors"
            >
              <div className={["h-10 w-10 rounded-2xl grid place-items-center", item.iconWrapClassName].join(" ")}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white/90">{item.title}</div>
                <div className="mt-0.5 text-xs text-white/55">{item.subtitle}</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 px-2 py-1 text-[10px] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.55)]" />
                  <span>{item.status}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-white/35" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mx-4 mt-10">
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="w-full h-12 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-200 font-semibold shadow-[0_0_24px_rgba(239,68,68,0.20)] hover:bg-red-500/15 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-60"
          disabled={loggingOut}
        >
          <LogOut className="h-5 w-5" />
          {loggingOut ? "退出中..." : "退出登录"}
        </button>
      </div>
      {editOpen ? (
        <div
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center px-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEdit();
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-6 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white">编辑个人资料</div>
                <div className="mt-1 text-xs text-white/55">更新头像与昵称，立即生效</div>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                aria-label="关闭"
              >
                ×
              </button>
            </div>

            <div className="mt-5">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="relative h-24 w-24 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,198,255,0.18)]"
                >
                  {draftAvatar ? (
                    <img src={draftAvatar} alt="头像预览" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-cyan-500/25 via-blue-500/15 to-violet-500/25 grid place-items-center">
                      <User className="h-10 w-10 text-cyan-200 drop-shadow-[0_0_12px_rgba(0,198,255,0.45)]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/35 grid place-items-center">
                    <div className="text-[11px] font-semibold text-white/90">点击更换</div>
                  </div>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = typeof reader.result === "string" ? reader.result : null;
                      if (result) setDraftAvatar(result);
                    };
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />
              </div>

              <div className="mt-5">
                <div className="text-xs text-white/70">昵称</div>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl bg-[#0B1324]/80 border border-white/10 px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/10 shadow-[0_0_18px_rgba(0,198,255,0.10)]"
                  placeholder="请输入昵称"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeEdit}
                className="h-11 rounded-xl bg-white/5 border border-white/10 text-white/80 font-semibold hover:bg-white/10 transition-all"
              >
                取消
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-[0.99] transition-all"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? (
        <div className="fixed left-1/2 top-6 z-[80] -translate-x-1/2 rounded-full bg-black/60 border border-white/10 px-4 py-2 text-xs text-white/85 backdrop-blur-md">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
