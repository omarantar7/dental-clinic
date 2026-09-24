export function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some((route) => path.startsWith(route));
}
