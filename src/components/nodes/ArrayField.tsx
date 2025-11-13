import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type ArrayFieldProps = {
  label: string;
  values: string[];
  placeholder?: string;
  multiline?: boolean;
  onChange: (values: string[]) => void;
  disabled?: boolean;
};

const ArrayField = ({ label, values, onChange, placeholder, multiline, disabled = false }: ArrayFieldProps) => {
  const Component = multiline ? Textarea : Input;

  const handleValueChange = (index: number, value: string) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-ink-strong">{label}</p>
      {values.length === 0 && (
        <p className="text-xs text-muted-foreground">No items yet. Add one below.</p>
      )}
      <div className="space-y-3">
        {values.map((value, index) => (
          <div key={`${label}-${index}`} className="flex gap-2">
            <Component
              value={value}
              onChange={(event) => handleValueChange(index, event.target.value)}
              placeholder={placeholder}
              disabled={disabled}
            />
            <Button variant="ghost" size="icon" onClick={() => handleRemove(index)} disabled={disabled}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={() => onChange([...values, ""])} disabled={disabled}>
        <Plus className="mr-2 h-4 w-4" /> Add item
      </Button>
    </div>
  );
};

export default ArrayField;
