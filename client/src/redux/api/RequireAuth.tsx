import { useLocation, Navigate, Outlet } from "react-router-dom";
import { selectCurrentToken } from "../slice/authSlice";
import { useAppSelector } from "../hooks";

export default function RequireAuth() {
  const token = useAppSelector(selectCurrentToken);
  const location = useLocation();
  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/authenticate" state={{ from: location }} replace />
  );
}
