"use client";

import { useEffect, useState } from "react";
import { readLibrary, type SavedPlan } from "@/lib/library";

/** Danh sách giáo án đã lưu trong trình duyệt; tự cập nhật khi thay đổi (kể cả từ tab khác). */
export function useLibrary() {
  const [items, setItems] = useState<SavedPlan[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setItems(readLibrary());
      setReady(true);
    };
    sync();
    window.addEventListener("teachmate:library", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("teachmate:library", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { items, ready };
}
