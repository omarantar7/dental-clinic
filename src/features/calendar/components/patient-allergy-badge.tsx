"use client";

import { TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import type { PatientAllergyBadgeProps } from "../types/calendar-props";

function PatientAllergyBadge({ alergies }: PatientAllergyBadgeProps) {
  const isMobile = useIsMobile();
  const allergyText = alergies?.trim();

  if (!allergyText) return null;

  const badge = (
    <Badge variant="destructive">
      <TriangleAlert data-icon="inline-start" />
      Allergies
    </Badge>
  );

  // Touch screens have no hover, so the details are spelled out inline.
  if (isMobile) {
    return (
      <span className="flex flex-col items-start gap-1">
        {badge}
        <span className="text-xs text-destructive">{allergyText}</span>
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>{badge}</TooltipTrigger>
      <TooltipContent>{allergyText}</TooltipContent>
    </Tooltip>
  );
}

export { PatientAllergyBadge };
