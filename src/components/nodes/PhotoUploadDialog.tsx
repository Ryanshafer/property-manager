import { useEffect, useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PhotoUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  initialUrl?: string | null;
  disabled?: boolean;
  saveLabel?: string;
  onSave: (url: string | null) => void;
};

const PhotoUploadDialog = ({
  open,
  onOpenChange,
  title,
  description,
  initialUrl = null,
  disabled = false,
  saveLabel = "Save image",
  onSave,
}: PhotoUploadDialogProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPreviewUrl(initialUrl ?? null);
    } else {
      setPreviewUrl(null);
      setDragging(false);
    }
  }, [open, initialUrl]);

  const handleFileSelection = (file?: File) => {
    if (disabled || !file) return;
    const preview = URL.createObjectURL(file);
    setPreviewUrl((current) => {
      if (current && current.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return preview;
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleSave = () => {
    if (disabled) return;
    onSave(previewUrl);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (disabled && nextOpen) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div
          className={cn(
            "relative aspect-[2/1] w-full overflow-hidden rounded-2xl border-2 border-dashed text-center",
            dragging ? "border-sidebar-primary bg-sidebar-primary/10" : "border-border bg-muted/20",
            disabled && "pointer-events-none opacity-70",
          )}
          onDragOver={(event) => {
            if (disabled) return;
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => !disabled && setDragging(false)}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute right-2 top-2 h-8 w-8 rounded-full text-destructive"
                onClick={() => !disabled && setPreviewUrl(null)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center px-4">
              <p className="max-w-xs text-sm text-ink-muted">Drop an image here or click “Choose file” to upload.</p>
            </div>
          )}
        </div>
        <div className="flex w-full items-center justify-between gap-3">
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              className="gap-2"
              disabled={disabled}
            >
              <Upload className="h-4 w-4" /> Choose file
            </Button>
            <Input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleFileSelection(event.target.files?.[0])}
              disabled={disabled}
            />
          </div>
          <Button type="button" disabled={disabled || !previewUrl} onClick={handleSave}>
            {saveLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUploadDialog;
