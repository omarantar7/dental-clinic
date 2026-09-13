"use client";

import { useState } from "react";
import { CalendarRange } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRangePreset } from "@/features/analytics/hooks/use-date-range";
import { DateRangeControlProps } from "../types/data-range-props";


const PRESETS: { value: Exclude<DateRangePreset, "custom">; label: string }[] =
  [
    { value: "7d", label: "7d" },
    { value: "30d", label: "30d" },
    { value: "90d", label: "90d" },
  ];

function DateRangeControl({
  preset,
  from,
  to,
  onPresetChange,
  onCustomRangeChange,
}: DateRangeControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);

  return (
    <div className="flex items-center gap-1">
      {PRESETS.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant={preset === option.value ? "default" : "outline"}
          onClick={() => onPresetChange(option.value)}
        >
          {option.label}
        </Button>
      ))}

      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) {
            setDraftFrom(from);
            setDraftTo(to);
          }
        }}
      >
        <PopoverTrigger
          render={
            <Button
              size="sm"
              variant={preset === "custom" ? "default" : "outline"}
            >
              <CalendarRange />
              {preset === "custom" ? `${from} – ${to}` : "Custom"}
            </Button>
          }
        />
        <PopoverContent className="w-64 gap-3">
          <Field>
            <FieldLabel htmlFor="range-from">From</FieldLabel>
            <Input
              id="range-from"
              type="date"
              value={draftFrom}
              max={draftTo}
              onChange={(e) => setDraftFrom(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="range-to">To</FieldLabel>
            <Input
              id="range-to"
              type="date"
              value={draftTo}
              min={draftFrom}
              onChange={(e) => setDraftTo(e.target.value)}
            />
          </Field>
          <Button
            size="sm"
            onClick={() => {
              onCustomRangeChange(draftFrom, draftTo);
              setIsOpen(false);
            }}
          >
            Apply
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { DateRangeControl };
