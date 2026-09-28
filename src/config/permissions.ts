// Single source of truth for secretary permissions. The `permission` table
// mirrors this list via src/scripts/sync-permissions.ts (runs on every deploy).
export const PERMISSIONS = {
  PATIENTS_VIEW: "PATIENTS_VIEW",
  PATIENTS_CREATE: "PATIENTS_CREATE",
  PATIENTS_UPDATE: "PATIENTS_UPDATE",
  PATIENTS_DELETE: "PATIENTS_DELETE",
  SESSIONS_VIEW: "SESSIONS_VIEW",
  SESSIONS_CREATE: "SESSIONS_CREATE",
  SESSIONS_UPDATE: "SESSIONS_UPDATE",
  SESSIONS_DELETE: "SESSIONS_DELETE",
  PAYMENTS_VIEW: "PAYMENTS_VIEW",
  PAYMENTS_CREATE: "PAYMENTS_CREATE",
  PAYMENTS_UPDATE: "PAYMENTS_UPDATE",
  PAYMENTS_DELETE: "PAYMENTS_DELETE",
  IMAGES_UPLOAD: "IMAGES_UPLOAD",
  IMAGES_UPDATE: "IMAGES_UPDATE",
  IMAGES_DELETE: "IMAGES_DELETE",
  DASHBOARD_VIEW: "DASHBOARD_VIEW",
  CALENDAR_VIEW: "CALENDAR_VIEW",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// A Record keyed by PermissionCode makes a missing description a compile error.
export const PERMISSION_DESCRIPTIONS: Record<PermissionCode, string> = {
  PATIENTS_VIEW: "View patients",
  PATIENTS_CREATE: "Add patients",
  PATIENTS_UPDATE: "Edit patients",
  PATIENTS_DELETE: "Delete patients",
  SESSIONS_VIEW: "View sessions",
  SESSIONS_CREATE: "Add sessions",
  SESSIONS_UPDATE: "Edit sessions",
  SESSIONS_DELETE: "Delete sessions",
  PAYMENTS_VIEW: "View payments and balances",
  PAYMENTS_CREATE: "Record payments",
  PAYMENTS_UPDATE: "Edit payments",
  PAYMENTS_DELETE: "Delete payments",
  IMAGES_UPLOAD: "Upload images",
  IMAGES_UPDATE: "Rename or replace images",
  IMAGES_DELETE: "Delete images",
  DASHBOARD_VIEW: "View the financial dashboard",
  CALENDAR_VIEW: "View the calendar",
};

export const ALL_PERMISSION_CODES = Object.values(PERMISSIONS);

// Groups for the roles form, derived from each code's prefix so a newly added
// code can't be left out; anything without a known prefix lands in "Other".
const PERMISSION_GROUP_LABELS: Record<string, string> = {
  PATIENTS: "Patients",
  SESSIONS: "Sessions",
  PAYMENTS: "Payments",
  IMAGES: "Images",
};

type PermissionGroup = { label: string; codes: PermissionCode[] };

export const PERMISSION_GROUPS: readonly PermissionGroup[] =
  ALL_PERMISSION_CODES.reduce<PermissionGroup[]>((groups, code) => {
    const label =
      PERMISSION_GROUP_LABELS[code.slice(0, code.indexOf("_"))] ?? "Other";
    const group = groups.find((existing) => existing.label === label);
    if (group) group.codes.push(code);
    else groups.push({ label, codes: [code] });
    return groups;
  }, []);

const PERMISSION_CODE_SET: ReadonlySet<string> = new Set(ALL_PERMISSION_CODES);

// Narrows codes read from the database, where the column is a plain string.
export function isPermissionCode(code: string): code is PermissionCode {
  return PERMISSION_CODE_SET.has(code);
}
