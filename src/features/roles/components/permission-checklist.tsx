"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  PERMISSION_DESCRIPTIONS,
  PERMISSION_GROUPS,
  type PermissionCode,
} from "@/config/permissions";
import type { PermissionChecklistProps } from "../types/role-props";

function PermissionChecklist({
  value,
  onChange,
  disabled,
}: PermissionChecklistProps) {
  const toggle = (code: PermissionCode, checked: boolean) => {
    onChange(
      checked ? [...value, code] : value.filter((current) => current !== code),
    );
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PERMISSION_GROUPS.map((group) => (
        <FieldSet key={group.label} className="gap-2">
          <FieldLegend variant="label" className="mb-0">
            {group.label}
          </FieldLegend>
          {group.codes.map((code) => (
            <Field key={code} orientation="horizontal">
              <Checkbox
                id={`permission-${code}`}
                checked={value.includes(code)}
                disabled={disabled}
                onCheckedChange={(checked) => toggle(code, checked)}
              />
              <FieldLabel htmlFor={`permission-${code}`} className="font-normal">
                {PERMISSION_DESCRIPTIONS[code]}
              </FieldLabel>
            </Field>
          ))}
        </FieldSet>
      ))}
    </div>
  );
}

export { PermissionChecklist };
