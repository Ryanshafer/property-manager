import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import AppSidebar from "@/components/AppSidebar";
import AddPropertyDialog from "@/components/dialogs/AddPropertyDialog";
import PageHeader from "@/components/PageHeader";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { Property } from "@/features/admin/types";
import { useAdmin } from "@/context/AdminProvider";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { properties, deleteProperty, selectProperty, cloneProperty, permissions } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const canCreateProperty = permissions.canAddEntities;
  const canCloneProperty = permissions.canAddEntities;

  const handleOpenProperty = (property: Property) => {
    selectProperty(property.id);
    navigate(`/properties/${property.id}`);
  };

  const handleDelete = () => {
    if (!deleteTarget || !permissions.canDeleteEntities) return;
    deleteProperty(deleteTarget.id);
    toast.success(`${deleteTarget.name} removed`);
    setDeleteTarget(null);
  };

  const headerActions = canCreateProperty ? (
    <AddPropertyDialog
      onCreate={(property) => {
        toast.success("Property created");
        handleOpenProperty(property);
      }}
    >
      <Button variant="outline" className="gap-2 px-5 font-semibold text-ink-strong">
        <Plus className="h-4 w-4" /> Add property
      </Button>
    </AddPropertyDialog>
  ) : null;

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
          title="Properties"
          description={`${properties.length} properties in portfolio`}
          actions={headerActions}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <main className="space-y-6 px-4 py-6 md:px-8">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onOpen={() => handleOpenProperty(property)}
                onClone={() => {
                  if (!canCloneProperty) return;
                  const cloned = cloneProperty({ sourceId: property.id, name: `${property.name} Clone` });
                  if (cloned) {
                    toast.success(`${cloned.name} created`);
                    handleOpenProperty(cloned);
                  }
                }}
                canClone={canCloneProperty}
                isViewer={permissions.isViewer}
              />
            ))}
          </section>
          {properties.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-ink-muted">
              No properties yet—start by adding your first one.
            </div>
          )}
        </main>
      </div>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete property</DialogTitle>
            <DialogDescription>
              Delete {deleteTarget?.name}? All changes from this session will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            {permissions.canDeleteEntities && (
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

export default DashboardPage;
