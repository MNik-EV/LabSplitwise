/** Nav hrefs from most specific to least — only one item may be active */
const NAV_HREFS = [
  "/orders/new",
  "/orders",
  "/members",
  "/settlement",
  "/settings",
  "/",
] as const;

function normalizePath(pathname: string): string {
  const path = pathname.split("?")[0].split("#")[0];
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

/** Returns the single active nav href, or empty string if none match */
export function getActiveNavHref(pathname: string): string {
  const path = normalizePath(pathname);

  for (const href of NAV_HREFS) {
    if (href === "/") {
      if (path === "/") return "/";
      continue;
    }
    if (path === href || path.startsWith(`${href}/`)) return href;
  }

  return "";
}

export function isNavActive(pathname: string, href: string): boolean {
  return getActiveNavHref(pathname) === href;
}
