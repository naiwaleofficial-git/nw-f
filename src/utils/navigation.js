export function dashboardFor(role) {
  if (role === "ADMIN") return "/admin";
  if (role === "SALON_OWNER") return "/owner";
  return null;
}
