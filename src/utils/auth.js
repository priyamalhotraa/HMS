export function getStoredAuth() {
  return {
    role: localStorage.getItem("role"),
    userId: localStorage.getItem("user_id"),
  };
}

export function isAuthenticated() {
  const { role, userId } = getStoredAuth();
  return Boolean(role && userId);
}

export function clearAuth() {
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
}

export function getDashboardPath(role) {
  if (role === "admin") return "/admin";
  if (role === "student") return "/student";
  if (role === "parent") return "/parent";
  return "/";
}
