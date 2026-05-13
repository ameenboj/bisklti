import { useSessionUser } from "./useSessionUser.js";

export function AdminNavLink() {
  const user = useSessionUser();

  if (user?.role !== "admin") {
    return null;
  }

  return <a href="/admin-dashboard.html">ADMIN</a>;
}
