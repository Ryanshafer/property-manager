import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";

import AppSidebar from "@/components/AppSidebar";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAdmin } from "@/context/AdminProvider";
import type { User } from "@/features/admin/types";
import UserCard from "@/features/admin/components/users/UserCard";
import { getUserSlug, isOperationsCoordinatorRole } from "@/features/admin/utils";

const UsersPage = () => {
  const navigate = useNavigate();
  const { users, properties, deleteUserAccount, permissions, user: sessionUser } = useAdmin();
  const sessionIsOps = sessionUser ? isOperationsCoordinatorRole(sessionUser.role) : false;
  const userList = Array.isArray(users) ? users : [];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<User | undefined>(undefined);

  const totalManagers = useMemo(
    () => userList.filter((user) => user.role?.toLowerCase().includes("manager")).length,
    [userList],
  );

  const handleDelete = () => {
    if (!pendingDelete || !permissions.canManageUsers) return;
    deleteUserAccount(pendingDelete.id);
    toast.success(`${pendingDelete.name} removed`);
    setPendingDelete(undefined);
  };

  return (
    <div className="flex min-h-dvh bg-surface text-foreground">
      <aside className="hidden w-72 md:block">
        <AppSidebar />
      </aside>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="md:hidden">
          <AppSidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 bg-foreground/10">
        <PageHeader
          title="Users"
          description={`${userList.length} teammates • ${totalManagers} property manager${totalManagers === 1 ? "" : "s"}`}
          breadcrumbs={[
            { label: "Properties", href: "/properties" },
            { label: "Users" },
          ]}
          actions={
            permissions.canManageUsers ? (
              <Button variant="outline" className="gap-2 px-4 text-base text-ink-strong" onClick={() => navigate("/users/new")}>
                <UserPlus className="h-4 w-4" />
                Add user
              </Button>
            ) : null
          }
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="space-y-6 px-4 py-6 md:px-8">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userList.map((user) => {
              const isSelf = sessionUser?.id === user.id;
              const canEditUser = !permissions.isViewer || (permissions.isViewer && sessionIsOps && isSelf);
              return (
                <UserCard
                  key={user.id}
                  user={user}
                  properties={properties}
                  onEdit={(selectedUser) => canEditUser && navigate(`/users/${getUserSlug(selectedUser)}`)}
                  onDelete={(selectedUser) => permissions.canManageUsers && setPendingDelete(selectedUser)}
                  canEdit={canEditUser}
                />
              );
            })}
          </section>
          {userList.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-ink-muted">
              Invite your first teammate to share access.
            </div>
          )}
        </main>
      </div>

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove user</DialogTitle>
            <p className="text-sm text-ink-muted">
              This action removes {pendingDelete?.name} from the workspace. They will lose access immediately.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(undefined)}>
              Cancel
            </Button>
            {permissions.canManageUsers && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Remove user
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
