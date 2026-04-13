import { Navigate } from "react-router-dom";
import { getDashboardPath, getStoredAuth, isAuthenticated } from "../utils/auth";

function ProtectedRoute({ allowedRole, children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const { role } = getStoredAuth();
  if (role !== allowedRole) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
