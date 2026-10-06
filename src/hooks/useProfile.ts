"use client";

import { useEffect, useState } from "react";

export type Profile = { school: string; className: string; teacher: string };
const KEY = "teachmate.profile";
const EMPTY: Profile = { school: "", className: "", teacher: "" };

/** Thông tin trường/lớp/giáo viên, lưu trong trình duyệt của cô (không gửi lên server). */
export function useProfile() {
  const [profile, setProfile] = useState<Profile>(EMPTY);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setProfile({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* chế độ riêng tư hoặc bị chặn lưu trữ: dùng giá trị rỗng */
    }
  }, []);

  function update(patch: Partial<Profile>) {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* bỏ qua */
      }
      return next;
    });
  }

  return { profile, update };
}
