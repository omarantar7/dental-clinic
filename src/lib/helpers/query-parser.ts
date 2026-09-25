import qs from "qs";

// Query-string values as parsed by qs: strings, arrays or nested objects.
export type RawQuery = Record<string, unknown>;

// Prisma-style filter built at runtime from the query string. Its shape can't
// be checked statically, so repositories cast it to their model's WhereInput.
export type DynamicWhere = Record<string, unknown>;

export function parseQueryString(search: string): RawQuery {
  return qs.parse(search.startsWith("?") ? search.slice(1) : search);
}

export interface ParsedListQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  where: DynamicWhere;
}
