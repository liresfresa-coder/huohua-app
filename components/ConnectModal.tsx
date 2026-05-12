"use client";

import { useEffect, useState } from "react";
import { Copy, QrCode, X } from "lucide-react";

export default function ConnectModal({
  isOpen,
  onClose,
  title,
  description,
  wechatId,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  wechatId: string;
}) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) setToast(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  async function copyWechatId() {
    try {
      await navigator.clipboard.writeText(wechatId);
      setToast("复制成功，请前往微信添加");
      window.setTimeout(() => setToast(null), 1600);
    } catch {
      window.alert("复制失败，请手动复制");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center">
      <div className="relative bg-[#060D24]/95 border border-cyan-500/40 rounded-3xl p-8 max-w-sm w-[90%] shadow-[0_0_30px_rgba(0,198,255,0.15)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-2xl bg-white/5 border border-white/10 text-white/70 transition-colors hover:bg-white/10 hover:text-cyan-200"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-lg font-semibold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
          {title}
        </div>
        <div className="mt-2 text-xs text-white/60">{description}</div>

        <div className="mt-6 flex items-center justify-center">
          <div className="rounded-2xl border-2 border-dashed border-cyan-500/50 p-2">
            <div className="relative h-44 w-44 rounded-xl bg-white/5 border border-white/10 overflow-hidden grid place-items-center">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(240px_circle_at_30%_25%,rgba(0,198,255,0.16),transparent_58%),radial-gradient(220px_circle_at_85%_70%,rgba(59,130,246,0.14),transparent_60%)]" />
              <QrCode className="h-12 w-12 text-cyan-200 drop-shadow-[0_0_14px_rgba(0,198,255,0.35)] relative z-10" />
              <div className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-cyan-400/60" />
              <div className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-cyan-400/60" />
              <div className="pointer-events-none absolute left-2 bottom-2 h-4 w-4 border-l-2 border-b-2 border-cyan-400/60" />
              <div className="pointer-events-none absolute right-2 bottom-2 h-4 w-4 border-r-2 border-b-2 border-cyan-400/60" />
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] text-white/55">
          长按保存二维码，或直接添加微信号
        </div>

        <button
          onClick={() => void copyWechatId()}
          className="mt-5 w-full h-12 rounded-2xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white font-semibold shadow-[0_18px_40px_rgba(0,198,255,0.18)] flex items-center justify-center gap-2"
        >
          <Copy className="h-4 w-4" />
          一键复制微信号：{wechatId}
        </button>

        {toast ? (
          <div className="fixed right-4 bottom-24 z-[80] rounded-full px-3 py-1 text-[11px] font-medium bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
            {toast}
          </div>
        ) : null}
      </div>
    </div>
  );
}

