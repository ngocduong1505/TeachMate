"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { listPlans, type SavedPlan } from "@/lib/library";

/** Danh sách giáo án đã lưu (trên máy hoặc trên tài khoản); tự cập nhật khi thay đổi. */
export function useLibrary() {
  const { user, ready } = useAuth();
  const [items, setItems] = useState<SavedPlan[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const sync = () =>
      listPlans()
        .then((list) => {
          if (cancelled) return;
          setItems(list);
          setError(false);
          setLoaded(true);
        })
        .catch(() => {
          if (cancelled) return;
          setError(true);
          setLoaded(true);
        });
    void sync();
    window.addEventListener("teachmate:library", sync);
    window.addEventListener("storage", sync);
    return () => {
      cancelled = true;
      window.removeEventListener("teachmate:library", sync);
      window.removeEventListener("storage", sync);
    };
  }, [ready, user?.id]);

  return { items, ready: loaded, error, user };
}
