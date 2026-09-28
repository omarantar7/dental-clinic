import { describe, expect, it } from "vitest";

import {
  ALL_PERMISSION_CODES,
  PERMISSION_GROUPS,
  PERMISSIONS,
  isPermissionCode,
} from "@/config/permissions";

describe("permission config", () => {
  it("puts every code in exactly one roles-form group", () => {
    const grouped = PERMISSION_GROUPS.flatMap((group) => group.codes);

    expect(grouped).toHaveLength(ALL_PERMISSION_CODES.length);
    expect(new Set(grouped)).toEqual(new Set(ALL_PERMISSION_CODES));
  });

  it("keeps each code's key and value identical", () => {
    for (const [key, value] of Object.entries(PERMISSIONS)) {
      expect(value).toBe(key);
    }
  });

  it("recognizes only configured codes", () => {
    expect(isPermissionCode(PERMISSIONS.PAYMENTS_DELETE)).toBe(true);
    expect(isPermissionCode("EDIT_PAYMENT")).toBe(false);
    expect(isPermissionCode("")).toBe(false);
  });
});
