import { Suspense, lazy, useEffect, type JSX } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AdminProvider, useAdmin } from "@/context/AdminProvider";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const DashboardPage = lazy(() => import("@/features/admin/pages/DashboardPage"));
const LoginPage = lazy(() => import("@/features/admin/pages/LoginPage"));
const PropertyEditorPage = lazy(() => import("@/features/admin/pages/PropertyEditorPage"));
const UsersPage = lazy(() => import("@/features/admin/pages/UsersPage"));
const UserEditorPage = lazy(() => import("@/features/admin/pages/UserEditorPage"));

const RootRedirect = () => {
  const { authed } = useAdmin();
  return <Navigate to={authed ? "/properties" : "/login"} replace />;
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { authed } = useAdmin();
  if (!authed) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const FALLBACK_ELEMENT_ID = "admin-app-fallback";

const LocalGuideAdminApp = () => {
  useEffect(() => {
    const fallback = document.getElementById(FALLBACK_ELEMENT_ID);
    fallback?.remove();
  }, []);

  return (
    <ThemeProvider>
      <AdminProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <div className="min-h-dvh bg-background text-foreground">
            <Toaster position="bottom-right" richColors className="app-toaster" />
            <Suspense
              fallback={
                <div className="flex min-h-dvh items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  <span>Loading…</span>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/properties"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/dashboard" element={<Navigate to="/properties" replace />} />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users/new"
                  element={
                    <ProtectedRoute>
                      <UserEditorPage mode="create" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users/:id"
                  element={
                    <ProtectedRoute>
                      <UserEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/:id"
                  element={
                    <ProtectedRoute>
                      <UserEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/properties/:id"
                  element={
                    <ProtectedRoute>
                      <PropertyEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </BrowserRouter>
      </AdminProvider>
    </ThemeProvider>
  );
};

export default LocalGuideAdminApp;
