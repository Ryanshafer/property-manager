import { memo, useCallback, useId } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type ArrayFieldProps = {
  label: string;
  values: string[];
  placeholder?: string;
  multiline?: boolean;
  onChange: (values: string[]) => void;
  disabled?: boolean;
  className?: string;
  emptyHint?: string;
};

const ArrayFieldComponent = ({
  label,
  values,
  onChange,
  placeholder,
  multiline,
  disabled = false,
  className,
  emptyHint = "No items yet. Add one below.",
}: ArrayFieldProps) => {
  const controlId = useId();
  const Component = multiline ? Textarea : Input;

  const handleValueChange = useCallback(
    (index: number, value: string) => {
      const next = [...values];
      next[index] = value;
      onChange(next);
    },
    [onChange, values],
  );

  const handleRemove = useCallback(
    (index: number) => {
      onChange(values.filter((_, idx) => idx !== index));
    },
    [onChange, values],
  );

  const handleAdd = () => {
    if (disabled) return;
    onChange([...values, ""]);
  };

  return (
    <div className={cn("space-y-2", className)} aria-live="polite">
      <p className="text-sm font-medium text-ink-strong" id={controlId}>
        {label}
      </p>
      {values.length === 0 && <p className="text-xs text-muted-foreground">{emptyHint}</p>}
      <div className="space-y-3">
        {values.map((value, index) => (
          <div key={`${controlId}-${index}`} className="flex gap-2">
            <Component
              value={value}
              onChange={(event) => handleValueChange(index, event.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              aria-labelledby={controlId}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              aria-label={`Remove ${label} entry ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleAdd} disabled={disabled}>
        <Plus className="mr-2 h-4 w-4" /> Add item
      </Button>
    </div>
  );
};

const ArrayField = memo(ArrayFieldComponent);
ArrayField.displayName = "ArrayField";

export default ArrayField;
