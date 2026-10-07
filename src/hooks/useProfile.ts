"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { currentSchoolYear, emptyProfile, listProfiles, saveProfile, type Profile } from "@/lib/profiles";

export type { Profile };

/**
 * Hồ sơ lớp theo năm học. Khách lưu trong trình duyệt, đã đăng nhập lưu trên tài khoản.
 * Thông tin trường/giáo viên chỉ dùng để in file Word; sĩ số và đặc điểm lớp được gửi kèm khi soạn.
 */
export function useProfile() {
  const { user, ready } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [year, setYear] = useState("");
  const [loaded, setLoaded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Profile | null>(null);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const p = pending.current;
    pending.current = null;
    if (p) void saveProfile(p).catch((e) => console.error("save profile failed", e));
  }, []);

  // Tải hồ sơ khi biết trạng thái đăng nhập (và tải lại khi đổi tài khoản)
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    flush();
    listProfiles()
      .then((list) => {
        if (cancelled) return;
        setProfiles(list);
        setYear((y) => y || currentSchoolYear());
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setYear((y) => y || currentSchoolYear());
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user?.id, flush]);

  useEffect(() => () => flush(), [flush]);

  const profile = useMemo(
    () => profiles.find((p) => p.schoolYear === year) ?? emptyProfile(year || currentSchoolYear()),
    [profiles, year],
  );

  /** Danh sách năm học để chọn: các năm đã có và năm hiện tại, mới nhất trước. */
  const years = useMemo(() => {
    const set = new Set([...profiles.map((p) => p.schoolYear), currentSchoolYear(), year].filter(Boolean));
    return [...set].sort().reverse();
  }, [profiles, year]);

  const update = useCallback(
    (patch: Partial<Profile>) => {
      const next = { ...profile, ...patch, schoolYear: profile.schoolYear };
      setProfiles((list) => [...list.filter((p) => p.schoolYear !== next.schoolYear), next]);
      pending.current = next;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 600);
    },
    [profile, flush],
  );

  /** Chuyển sang năm học khác; năm mới chưa có hồ sơ thì chép sẵn trường/tổ/giáo viên từ năm trước. */
  const switchYear = useCallback(
    (next: string) => {
      flush();
      if (!profiles.some((p) => p.schoolYear === next)) {
        const base = { ...profile, schoolYear: next, className: "", classSize: "", classTraits: "" };
        setProfiles((list) => [...list, base]);
        void saveProfile(base).catch((e) => console.error("save profile failed", e));
      }
      setYear(next);
    },
    [profile, profiles, flush],
  );

  return { profile, update, years, year, switchYear, loaded, saved: !!user };
}
