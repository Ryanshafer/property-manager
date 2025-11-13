import { forwardRef, useId, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type FormRowProps = {
  label: string;
  description?: ReactNode;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
};

const FormRow = forwardRef<HTMLDivElement, FormRowProps>(
  ({ label, description, children, htmlFor, className }, ref) => {
    const generatedId = useId();
    const controlId = htmlFor ?? generatedId;
    const descriptionId = description ? `${controlId}-description` : undefined;

    return (
      <div ref={ref} className={cn("space-y-1", className)}>
        <Label htmlFor={htmlFor ? htmlFor : controlId}>{label}</Label>
        {description && (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        <div aria-describedby={descriptionId}>{children}</div>
      </div>
    );
  },
);

FormRow.displayName = "FormRow";

export default FormRow;
