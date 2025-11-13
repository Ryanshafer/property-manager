import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

import AppSidebar from "@/components/AppSidebar";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAdmin } from "@/context/AdminProvider";
import type { User } from "@/features/admin/types";
import UserEditorForm, { createUserDraft, type UserFormState } from "@/features/admin/components/users/UserEditorForm";
import {
  WEEK_DAYS as ALL_DAYS,
  getUserSlug,
  isPropertyManagerRole,
  isPropertyOwnerRole,
  isOperationsCoordinatorRole,
} from "@/features/admin/utils";

type UserEditorPageProps = {
  mode?: "create" | "edit";
};

const USER_SECTIONS = [
  { id: "user-details", label: "User Details" },
  { id: "contacts", label: "Contacts" },
  { id: "managed-properties", label: "Managed properties" },
  { id: "danger-zone", label: "Danger Zone" },
] as const;

type SectionId = (typeof USER_SECTIONS)[number]["id"];
type FormSectionId = Exclude<SectionId, "danger-zone">;

const UserEditorPage = ({ mode = "edit" }: UserEditorPageProps) => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCreate = mode === "create";
  const { users, properties, addUser, updateUser, deleteUserAccount, permissions, user: sessionUser } = useAdmin();
  const userList = Array.isArray(users) ? users : [];
  const currentUser = useMemo(
    () =>
      isCreate
        ? undefined
        : userList.find((user) => {
            const slug = getUserSlug(user);
            return user.id === params.id || slug === params.id;
          }),
    [isCreate, params.id, userList],
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("user-details");
  const [draft, setDraft] = useState<UserFormState>(() => createUserDraft(currentUser));
  const [baseline, setBaseline] = useState<UserFormState>(() => createUserDraft(currentUser));
  const canManageProperties = useMemo(
    () => isPropertyManagerRole(draft.role) || isPropertyOwnerRole(draft.role),
    [draft.role],
  );
  const editingSelf = Boolean(!isCreate && currentUser && sessionUser && currentUser.id === sessionUser.id);
  const sessionIsOps = Boolean(sessionUser && isOperationsCoordinatorRole(sessionUser.role));
  const allowSelfProfileEdit = editingSelf && sessionIsOps;
  const readOnly = permissions.isViewer;
  const canEditName = !readOnly || allowSelfProfileEdit;
  const canEditContacts = !readOnly || allowSelfProfileEdit;
  const canEditAvatar = !readOnly || allowSelfProfileEdit;
  const canSaveChanges = !readOnly || allowSelfProfileEdit;

  useEffect(() => {
    const next = createUserDraft(currentUser);
    setDraft(next);
    setBaseline(next);
  }, [currentUser, isCreate]);

  useEffect(() => {
    if (activeSection === "managed-properties" && (!canManageProperties || readOnly)) {
      setActiveSection("user-details");
    }
  }, [activeSection, canManageProperties, readOnly]);

  const normalize = (state: UserFormState) => ({
    id: state.id,
    name: state.name.trim(),
    role: state.role.trim(),
    availability: {
      always: state.availability.always,
      days: [...state.availability.days].sort((a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b)),
      start: state.availability.start || "00:00",
      end: state.availability.end || "23:59",
    },
    photo: state.photo?.trim(),
    accessLevel: state.accessLevel,
    channels: state.channels.map(({ localId, ...channel }) => channel),
    managedPropertyIds: state.managedPropertyIds,
  });

  const isDirty = useMemo(() => JSON.stringify(normalize(draft)) !== JSON.stringify(normalize(baseline)), [draft, baseline]);

  const handleSave = () => {
    if (readOnly && !allowSelfProfileEdit) return;
    const payload = normalize(draft);

    if (isCreate) {
      if (!permissions.canManageUsers) return;
      const created = addUser(payload);
      toast.success(`${created.name} created`);
      const nextDraft = createUserDraft(created);
      setDraft(nextDraft);
      setBaseline(nextDraft);
      navigate(`/users/${getUserSlug(created)}`, { replace: true });
      return;
    }

    if (!currentUser) return;
    if (!permissions.canEditContent && !allowSelfProfileEdit) return;
    updateUser({
      ...currentUser,
      ...payload,
      id: currentUser.id,
    });
    toast.success("User updated");
    const nextDraft = createUserDraft({
      ...currentUser,
      ...payload,
      id: currentUser.id,
    });
    setDraft(nextDraft);
    setBaseline(nextDraft);
  };

  const handleDelete = () => {
    if (!currentUser || !permissions.canManageUsers) return;
    deleteUserAccount(currentUser.id);
    toast.success(`${currentUser.name} removed`);
    navigate("/users");
  };

  if (!isCreate && !currentUser) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background text-center">
        <p className="text-lg font-semibold">We couldn&apos;t find that user.</p>
        <Button variant="link" onClick={() => navigate("/users")}>
          Back to users
        </Button>
      </div>
    );
  }

  const title = isCreate ? "Add user" : currentUser?.name || "Team member";
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Users", href: "/users" },
    { label: isCreate ? "Add user" : currentUser?.name || "Edit" },
  ];

  const visibleSections = useMemo(
    () => USER_SECTIONS.filter((section) => section.id !== "managed-properties" || (canManageProperties && !readOnly)),
    [canManageProperties, readOnly],
  );

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

      <div className="flex-1">
        <PageHeader
          title={title}
          description={isCreate ? "Invite a teammate or manager" : currentUser?.role}
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate("/users")}> 
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {canSaveChanges && (
                <Button onClick={handleSave} disabled={!isDirty}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              )}
            </div>
          }
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="px-4 py-6 md:px-8">
          {readOnly && !allowSelfProfileEdit && (
            <div className="mb-6 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-ink-muted">
              View-only access: switch to an editor or admin to make changes.
            </div>
          )}
          {canSaveChanges && isDirty && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              You have unsaved changes. Select “Save” to update the workspace.
            </div>
          )}

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="lg:w-64">
              <nav className="rounded-2xl border border-border bg-card/60 p-2">
                  <div className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
                    {visibleSections.map((section) => {
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          type="button"
                          key={section.id}
                          className={`flex w-full items-center justify-start rounded-xl px-3 py-2 text-sm font-medium transition ${
                            isActive ? "bg-secondary text-ink-strong shadow" : "text-ink-muted hover:bg-muted/60"
                          }`}
                          onClick={() => setActiveSection(section.id)}
                        >
                          {section.label}
                        </button>
                      );
                    })}
                  </div>
                </nav>
              </div>
              <div className="flex-1 space-y-6">
                {activeSection === "danger-zone" ? (
                  <section className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-base font-semibold text-destructive">Danger zone</p>
                        <p className="text-sm text-destructive/80">
                          {isCreate
                            ? "Create the user before you can remove access."
                            : "Removing this user immediately revokes their access."}
                        </p>
                      </div>
                      {!isCreate && permissions.canManageUsers && (
                        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove user
                        </Button>
                      )}
                    </div>
                  </section>
                ) : (
                  <UserEditorForm
                    value={draft}
                    properties={properties}
                    activeSection={activeSection as FormSectionId}
                    onChange={setDraft}
                    readOnly={readOnly}
                    canEditAccessLevel={permissions.canManageUsers}
                    canEditName={canEditName}
                    canEditContacts={canEditContacts}
                    canEditAvatar={canEditAvatar}
                  />
                )}
              </div>
            </div>
        </main>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <p className="text-sm text-ink-muted">
              This action removes {currentUser?.name}. Are you sure you want to continue?
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={!permissions.canManageUsers}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserEditorPage;
