import { describe, expect, it } from "vitest";

import { PERMISSIONS } from "@/config/permissions";
import { RoleCreateSchema, RoleUpdateSchema } from "@/types/role";

// These schemas validate both the role form and the /api/roles routes.
describe("RoleCreateSchema", () => {
  it("trims the name and drops duplicate codes", () => {
    const result = RoleCreateSchema.parse({
      name: "  Front Desk  ",
      permission_codes: [
        PERMISSIONS.PATIENTS_VIEW,
        PERMISSIONS.PATIENTS_VIEW,
        PERMISSIONS.SESSIONS_VIEW,
      ],
    });

    expect(result).toEqual({
      name: "Front Desk",
      permission_codes: [PERMISSIONS.PATIENTS_VIEW, PERMISSIONS.SESSIONS_VIEW],
    });
  });

  it("accepts a role with no permissions", () => {
    expect(
      RoleCreateSchema.safeParse({ name: "Trainee", permission_codes: [] })
        .success,
    ).toBe(true);
  });

  it.each([
    ["an unknown code", { name: "Role", permission_codes: ["EDIT_PAYMENT"] }],
    ["a one-character name", { name: "A", permission_codes: [] }],
    ["a whitespace-only name", { name: "   ", permission_codes: [] }],
    ["a 51-character name", { name: "x".repeat(51), permission_codes: [] }],
    ["missing permission_codes", { name: "Role" }],
  ])("rejects %s", (_label, input) => {
    expect(RoleCreateSchema.safeParse(input).success).toBe(false);
  });
});

describe("RoleUpdateSchema", () => {
  it("rejects an empty update", () => {
    expect(RoleUpdateSchema.safeParse({}).success).toBe(false);
  });

  it("accepts a name-only update", () => {
    expect(RoleUpdateSchema.parse({ name: "Billing" })).toEqual({
      name: "Billing",
    });
  });

  it("accepts a permissions-only update", () => {
    expect(
      RoleUpdateSchema.parse({ permission_codes: [PERMISSIONS.CALENDAR_VIEW] }),
    ).toEqual({ permission_codes: [PERMISSIONS.CALENDAR_VIEW] });
  });
});
