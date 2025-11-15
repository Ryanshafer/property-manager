import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Download, Save, Trash2 } from "lucide-react";

import AppSidebar from "@/components/AppSidebar";
import PageHeader from "@/components/PageHeader";
const PropertyFormTabs = lazy(() => import("@/components/PropertyFormTabs"));
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { Property } from "@/features/admin/types";
import { formatUpdatedAt } from "@/features/admin/utils";
import { useAdmin } from "@/context/AdminProvider";

const PropertyEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties, selectProperty, updateProperty, exportProperty, deleteProperty, permissions, users } = useAdmin();
  const property = useMemo(() => properties.find((item) => item.id === id), [properties, id]);
  const [draft, setDraft] = useState<Property | null>(property ?? null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const readOnly = permissions.isViewer;
  const canDelete = permissions.canDeleteEntities;

  useEffect(() => {
    if (property) {
      setDraft(property);
      selectProperty(property.id);
    }
  }, [property, selectProperty]);

  if (!property || !draft) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background text-center">
        <p className="text-lg font-semibold">Property not found</p>
        <Button variant="link" onClick={() => navigate("/properties")}>Back to properties</Button>
      </div>
    );
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(property);

  const handleNodeChange = <K extends keyof Property>(node: K, value: Property[K]) => {
    if (readOnly || !draft) return;
    setDraft({ ...draft, [node]: value });
  };

  const handleSave = () => {
    if (!draft || readOnly) return;
    updateProperty(draft);
    toast.success("Saved successfully");
  };

  const handleExport = () => {
    const payload = exportProperty(draft.id);
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${draft.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Export ready");
  };

  const handleDelete = () => {
    if (!draft || !canDelete) return;
    deleteProperty(draft.id);
    toast.success(`${draft.name} deleted`);
    setDeleteOpen(false);
    navigate("/properties");
  };

  return (
    <div className="flex min-h-dvh bg-surface text-foreground">
      <aside className="hidden w-72 lg:block">
        <AppSidebar />
      </aside>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="lg:hidden">
          <AppSidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex-1">
        <PageHeader
          title={draft.name}
          description={`Last update ${formatUpdatedAt(draft.updatedAt)}`}
          breadcrumbs={[
            { label: "Properties", href: "/properties" },
            { label: draft.name },
          ]}
          actions={
            <div className="flex flex-wrap gap-2">
              {!readOnly && (
                <Button onClick={handleSave} disabled={!isDirty}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              )}
            </div>
          }
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <main className="space-y-6 px-4 py-6 md:px-8">
          {readOnly && (
            <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-ink-muted">
              You are viewing this property in read-only mode. Switch to an account with edit access to make changes.
            </div>
          )}
          {!readOnly && isDirty && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              You have unsaved changes. Select “Save” to update the guest guide.
            </div>
          )}
          <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Property name</Label>
                <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} disabled={readOnly} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={draft.location || ""} onChange={(event) => setDraft({ ...draft, location: event.target.value })} disabled={readOnly} />
              </div>
            </div>
          </section>
          <Suspense
            fallback={
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-ink-muted">
                Loading property sections…
              </div>
            }
          >
            <PropertyFormTabs
              value={draft}
              onNodeChange={handleNodeChange}
              onDeleteRequest={() => setDeleteOpen(true)}
              readOnly={readOnly}
              canDelete={canDelete}
              showDangerZone={permissions.isAdmin}
              users={users}
            />
          </Suspense>
        </main>
      </div>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete property</DialogTitle>
            <DialogDescription>This action removes the property from the current session.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            {canDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyEditorPage;
