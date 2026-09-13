interface DateRangeControlProps {
  preset: DateRangePreset;
  from: string;
  to: string;
  onPresetChange: (preset: Exclude<DateRangePreset, "custom">) => void;
  onCustomRangeChange: (from: string, to: string) => void;
}

type DateRangePreset = "7d" | "30d" | "90d" | "custom";

export { type DateRangeControlProps, type DateRangePreset };
