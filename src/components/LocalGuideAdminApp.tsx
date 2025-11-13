import { Suspense, type JSX } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AdminProvider, useAdmin } from "@/context/AdminProvider";
import DashboardPage from "@/features/admin/pages/DashboardPage";
import LoginPage from "@/features/admin/pages/LoginPage";
import PropertyEditorPage from "@/features/admin/pages/PropertyEditorPage";
import UsersPage from "@/features/admin/pages/UsersPage";
import UserEditorPage from "@/features/admin/pages/UserEditorPage";
import { Toaster } from "@/components/ui/sonner";
import ThemeToggle from "@/components/ThemeToggle";

const RootRedirect = () => {
  const { authed } = useAdmin();
  return <Navigate to={authed ? "/dashboard" : "/login"} replace />;
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { authed } = useAdmin();
  if (!authed) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const LocalGuideAdminApp = () => {
  return (
    <ThemeProvider>
      <AdminProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <div className="min-h-dvh bg-background text-foreground">
            <Toaster position="bottom-right" richColors className="app-toaster" />
            <Suspense fallback={<div className="flex min-h-dvh items-center justify-center text-muted-foreground">Loading…</div>}>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
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
