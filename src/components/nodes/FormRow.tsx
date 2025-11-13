import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

const FormRow = ({ label, description, children }: { label: string; description?: string; children: ReactNode }) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    {description && <p className="text-xs text-muted-foreground">{description}</p>}
    {children}
  </div>
);

export default FormRow;
