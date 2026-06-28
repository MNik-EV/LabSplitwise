/** Active nav item — avoids /orders and /orders/new both highlighting */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";

  if (href === "/orders/new") return pathname === "/orders/new";

  if (href === "/orders") {
    return (
      pathname === "/orders" ||
      (pathname.startsWith("/orders/") && !pathname.startsWith("/orders/new"))
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
