"use client";

import { useState } from "react";

import { toDateInputValue } from "@/utils/format";
import { DateRangePreset } from "../types/data-range-props";

function computePresetRange(preset: Exclude<DateRangePreset, "custom">) {
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: toDateInputValue(from), to: toDateInputValue(to) };
}

function useDateRange(
  defaultPreset: Exclude<DateRangePreset, "custom"> = "7d",
) {
  const [preset, setPreset] = useState<DateRangePreset>(defaultPreset);
  const [range, setRange] = useState(() => computePresetRange(defaultPreset));

  const applyPreset = (nextPreset: Exclude<DateRangePreset, "custom">) => {
    setPreset(nextPreset);
    setRange(computePresetRange(nextPreset));
  };

  const applyCustomRange = (from: string, to: string) => {
    setPreset("custom");
    setRange({ from, to });
  };

  return {
    preset,
    from: range.from,
    to: range.to,
    applyPreset,
    applyCustomRange,
  };
}

export { useDateRange, type DateRangePreset };
