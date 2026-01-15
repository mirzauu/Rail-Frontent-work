import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { FullscreenLoader } from "@/components/shared/Spinner";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [hasToken, setHasToken] = useState<boolean>(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const token = api.getToken();
      setHasToken(!!token);
      setChecking(false);
    }, 200);
    return () => clearTimeout(t);
  }, [location.key]);

  if (checking) {
    return <FullscreenLoader text="Loading RailvisionAI..." />;
  }

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

