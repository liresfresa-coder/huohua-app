"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type UserContextValue = {
  nickname: string;
  avatar: string | null;
  updateUserInfo: (newName: string, newAvatar: string | null) => void;
  resetUserInfo: () => void;
  setIdentityEmail: (email: string | null) => void;
  identityEmail: string | null;
};

const UserContext = createContext<UserContextValue | null>(null);

const LAST_EMAIL_KEY = "huohua_last_email_v1";

function nicknameKey(email: string) {
  return `nickname_${email}`;
}

function avatarKey(email: string) {
  return `avatar_${email}`;
}

function readStoredProfileByEmail(email: string): { nickname: string; avatar: string | null } {
  try {
    const rawNickname = localStorage.getItem(nicknameKey(email));
    const rawAvatar = localStorage.getItem(avatarKey(email));
    const nickname = typeof rawNickname === "string" && rawNickname.trim() ? rawNickname.trim() : "探索者";
    const avatar = typeof rawAvatar === "string" && rawAvatar.trim() ? rawAvatar : null;
    return { nickname, avatar };
  } catch {
    return { nickname: "探索者", avatar: null };
  }
}

function writeStoredProfileByEmail(email: string, next: { nickname: string; avatar: string | null }) {
  try {
    localStorage.setItem(nicknameKey(email), next.nickname);
    if (next.avatar) localStorage.setItem(avatarKey(email), next.avatar);
    else localStorage.removeItem(avatarKey(email));
    localStorage.setItem(LAST_EMAIL_KEY, email);
  } catch {}
}

function clearStoredProfileByEmail(email: string) {
  try {
    localStorage.removeItem(nicknameKey(email));
    localStorage.removeItem(avatarKey(email));
  } catch {}
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(() => {
    try {
      const lastEmail = localStorage.getItem(LAST_EMAIL_KEY);
      if (lastEmail && lastEmail.trim()) return { identityEmail: lastEmail, ...readStoredProfileByEmail(lastEmail) };
    } catch {}
    return { identityEmail: null as string | null, nickname: "探索者", avatar: null as string | null };
  }, []);

  const [identityEmail, setIdentityEmailState] = useState<string | null>(initial.identityEmail);
  const identityEmailRef = useRef<string | null>(initial.identityEmail);
  const [nickname, setNickname] = useState(initial.nickname);
  const [avatar, setAvatar] = useState<string | null>(initial.avatar);

  const setIdentityEmail = useCallback((email: string | null) => {
    const normalized = email && email.trim() ? email.trim() : null;
    identityEmailRef.current = normalized;
    setIdentityEmailState(normalized);
    if (normalized) {
      const stored = readStoredProfileByEmail(normalized);
      setNickname(stored.nickname);
      setAvatar(stored.avatar);
    }
  }, []);

  const updateUserInfo = useCallback((newName: string, newAvatar: string | null) => {
    const nextName = (newName || "").trim() || "探索者";
    setNickname(nextName);
    setAvatar(newAvatar);
    const email = identityEmailRef.current;
    if (email) writeStoredProfileByEmail(email, { nickname: nextName, avatar: newAvatar });
  }, []);

  const resetUserInfo = useCallback(() => {
    const email = identityEmailRef.current;
    setNickname("探索者");
    setAvatar(null);
    if (email) clearStoredProfileByEmail(email);
    try {
      localStorage.removeItem(LAST_EMAIL_KEY);
    } catch {}
    identityEmailRef.current = null;
    setIdentityEmailState(null);
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({ nickname, avatar, updateUserInfo, resetUserInfo, setIdentityEmail, identityEmail }),
    [nickname, avatar, updateUserInfo, resetUserInfo, setIdentityEmail, identityEmail],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
