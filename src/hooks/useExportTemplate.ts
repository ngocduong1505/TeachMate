"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_TEMPLATE, readTemplate, writeTemplate, type ExportTemplate } from "@/lib/exportTemplate";

export function useExportTemplate() {
  const [template, setTemplate] = useState<ExportTemplate>(DEFAULT_TEMPLATE);

  useEffect(() => setTemplate(readTemplate()), []);

  const update = useCallback((patch: Partial<ExportTemplate>) => {
    setTemplate((prev) => {
      const next = { ...prev, ...patch };
      writeTemplate(next);
      return next;
    });
  }, []);

  return { template, update };
}
