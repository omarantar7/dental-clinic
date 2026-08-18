import qs from "qs";

export function parseQueryString(search: string): Record<string, any> {
  return qs.parse(search.startsWith("?") ? search.slice(1) : search);
}

export interface ParsedListQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  where: Record<string, any>;
}
