"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ResponsivePopover } from "@/components/ui/responsive-popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestQuery } from "@/hooks/use-rest-query";
import type { PatientListItem } from "@/types/patient";
import { formatDateTimeRange } from "@/utils/format";
import type { SlotPatientPickerProps } from "../types/calendar-props";
import { PatientAllergyBadge } from "./patient-allergy-badge";

const PATIENT_SEARCH_FIELDS = ["full_name"];

function SlotPatientPicker({ slot, onClose, onSelect }: SlotPatientPickerProps) {
  const { data, isLoading, search, setSearch } =
    useRestQuery<PatientListItem>("/api/patients", {
      searchFields: PATIENT_SEARCH_FIELDS,
      defaultSort: "full_name",
      perPage: 8,
    });

  return (
    <ResponsivePopover
      open
      onOpenChange={(open) => !open && onClose()}
      anchor={slot.anchor}
      title="New session"
      description={formatDateTimeRange(slot.start, slot.end)}
    >
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          autoFocus
          placeholder="Search patient by name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </InputGroup>

      <div className="-mx-1 flex max-h-72 flex-col gap-0.5 overflow-y-auto">
        {isLoading && data.length === 0 ? (
          Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="mx-1 h-10" />
          ))
        ) : data.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No patients found.
          </p>
        ) : (
          data.map((patient) => (
            <Button
              key={patient.id}
              variant="ghost"
              className="h-auto w-full justify-between gap-3 px-2 py-1.5 text-left whitespace-normal"
              onClick={() => onSelect(patient)}
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">
                  {patient.full_name}
                </span>
                <span className="truncate text-muted-foreground">
                  {patient.phone_number}
                </span>
              </span>
              <PatientAllergyBadge alergies={patient.alergies} />
            </Button>
          ))
        )}
      </div>
    </ResponsivePopover>
  );
}

export { SlotPatientPicker };
