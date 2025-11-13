import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Property } from "@/features/admin/types";
import { useAdmin } from "@/context/AdminProvider";

export type ImportJsonDialogProps = {
  children: ReactNode;
  onImport?: (property: Property) => void;
};

const ImportJsonDialog = ({ children, onImport }: ImportJsonDialogProps) => {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { importProperty } = useAdmin();

  const handleImport = () => {
    try {
      const parsed = JSON.parse(raw) as Property;
      // TODO(validation): Strengthen JSON validation
      importProperty(parsed);
      onImport?.(parsed);
      setError(null);
      setRaw("");
      setOpen(false);
    } catch (err) {
      setError("Invalid JSON: paste a complete property export.");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import JSON</DialogTitle>
          <DialogDescription>Paste an exported property to sync every node.</DialogDescription>
        </DialogHeader>
        <Textarea rows={10} value={raw} onChange={(event) => setRaw(event.target.value)} placeholder='{"id":"villa"...}' />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!raw.trim()}>
            Import property
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportJsonDialog;
