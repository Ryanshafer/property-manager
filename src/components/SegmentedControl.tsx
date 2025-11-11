import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string | number> = {
  id: T;
  label: ReactNode;
  activeClassName?: string;
};

interface SegmentedControlProps<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

const SegmentedControl = <T extends string | number>({ options, value, onChange, className }: SegmentedControlProps<T>) => {
  return (
    <div className={cn("rounded-full bg-neutral-200 p-1 text-xs font-semibold text-neutral-900 shadow-inner", className)}>
      <div className="flex items-center gap-1">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-center transition",
              option.id === value
                ? cn("text-neutral-900 shadow", option.activeClassName ?? "bg-white")
                : "text-neutral-600 hover:text-neutral-900",
            )}
            aria-pressed={option.id === value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SegmentedControl;
