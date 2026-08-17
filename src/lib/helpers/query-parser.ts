import qs from "qs";

export function parseQueryString(search: string): Record<string, any> {
  return qs.parse(search.startsWith("?") ? search.slice(1) : search);
}
