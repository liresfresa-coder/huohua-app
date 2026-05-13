"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/src/lib/supabase";
import { useUser } from "@/context/UserContext";

type ToastState =
  | null
  | { variant: "success"; message: string }
  | { variant: "error"; message: string };

export default function Login() {
  const router = useRouter();
  const { avatar, updateUserInfo, setIdentityEmail } = useUser();
  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(t);
  }, [toast]);

  async function handleSubmit() {
    if (!supabase) {
      setErrorText("缺少 Supabase 环境变量配置");
      return;
    }

    setSubmitting(true);
    setErrorText(null);

    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setErrorText(error.message);
          setToast({ variant: "error", message: "登录失败" });
          return;
        }
        const userEmail = data.user?.email ?? email;
        const metaNick = (data.user?.user_metadata as Record<string, unknown> | null)?.nickname;
        const metaAvatar = (data.user?.user_metadata as Record<string, unknown> | null)?.avatar;
        const storedNick = (() => {
          try {
            const v = localStorage.getItem(`nickname_${userEmail}`);
            return typeof v === "string" && v.trim() ? v.trim() : "";
          } catch {
            return "";
          }
        })();
        const storedAvatar = (() => {
          try {
            const v = localStorage.getItem(`avatar_${userEmail}`);
            return typeof v === "string" && v.trim() ? v : null;
          } catch {
            return null;
          }
        })();
        const name =
          typeof metaNick === "string" && metaNick.trim()
            ? metaNick.trim()
            : storedNick
              ? storedNick
              : (userEmail.split("@")[0] || "探索者").trim() || "探索者";
        const nextAvatar =
          typeof metaAvatar === "string" && metaAvatar.trim()
            ? metaAvatar
            : storedAvatar ?? avatar;
        if (userEmail) setIdentityEmail(userEmail);
        updateUserInfo(name, nextAvatar);
        setToast({ variant: "success", message: "登录成功" });
        router.replace("/");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setErrorText(error.message);
        setToast({ variant: "error", message: "注册失败" });
        return;
      }

      if (!data.session) {
        setErrorText("注册成功但未获取到会话，请稍后直接登录");
        setToast({ variant: "error", message: "注册失败" });
        return;
      }

      const userEmail = data.user?.email ?? email;
      const metaNick = (data.user?.user_metadata as Record<string, unknown> | null)?.nickname;
      const metaAvatar = (data.user?.user_metadata as Record<string, unknown> | null)?.avatar;
      const storedNick = (() => {
        try {
          const v = localStorage.getItem(`nickname_${userEmail}`);
          return typeof v === "string" && v.trim() ? v.trim() : "";
        } catch {
          return "";
        }
      })();
      const storedAvatar = (() => {
        try {
          const v = localStorage.getItem(`avatar_${userEmail}`);
          return typeof v === "string" && v.trim() ? v : null;
        } catch {
          return null;
        }
      })();
      const name =
        typeof metaNick === "string" && metaNick.trim()
          ? metaNick.trim()
          : storedNick
            ? storedNick
            : (userEmail.split("@")[0] || "探索者").trim() || "探索者";
      const nextAvatar =
        typeof metaAvatar === "string" && metaAvatar.trim()
          ? metaAvatar
          : storedAvatar ?? avatar;
      if (userEmail) setIdentityEmail(userEmail);
      updateUserInfo(name, nextAvatar);
      setToast({ variant: "success", message: "欢迎加入" });
      router.replace("/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-[#020617] text-white">
      <div className="min-h-dvh w-full flex items-center justify-center px-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-auto">
          <div className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "欢迎回来" : "创建账号"}
          </div>
          <div className="mt-1 text-sm text-white/60">
            {mode === "signin"
              ? "使用邮箱登录你的账号"
              : "使用邮箱快速注册并开始训练"}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="text-xs font-medium text-white/70">邮箱</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,198,255,0.3)]"
                autoComplete="email"
                disabled={submitting}
              />
            </div>

            <div>
              <div className="text-xs font-medium text-white/70">密码</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="请输入密码"
                className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,198,255,0.3)]"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                disabled={submitting}
              />
              {errorText ? (
                <div className="mt-2 text-xs text-red-300">{errorText}</div>
              ) : null}
            </div>
          </div>

          <button
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="mt-6 h-12 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(0,198,255,0.22)] disabled:opacity-60"
          >
            {submitting ? "处理中..." : mode === "signin" ? "登录" : "注册"}
          </button>

          <button
            onClick={() => {
              if (submitting) return;
              setErrorText(null);
              setMode((m) => (m === "signin" ? "signup" : "signin"));
            }}
            className="mt-4 w-full text-center text-xs text-white/60 hover:text-white/80"
          >
            {mode === "signin" ? "没有账号？点击注册" : "已有账号？点击登录"}
          </button>
        </div>
      </div>

      {toast ? (
        <div
          className={[
            "fixed right-4 bottom-6 z-[70] rounded-full px-3 py-1 text-[11px] font-medium shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
            toast.variant === "success"
              ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
              : "bg-red-500/15 text-red-300 ring-1 ring-red-400/30",
          ].join(" ")}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
