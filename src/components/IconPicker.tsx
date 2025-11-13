import { useMemo, useState } from "react";
import icons from "@/data/lucide-icons.json";
import * as lucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type IconPickerProps = {
  value?: string;
  onSelect: (icon: string) => void;
};

const IconPicker = ({ value, onSelect }: IconPickerProps) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return icons;
    return icons.filter((name) => name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search icons"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="h-[460px] overflow-y-auto rounded-xl border border-border">
        <div className="grid grid-cols-4 gap-2 p-2">
          {filtered.map((iconName) => {
            const IconComponent = (lucideIcons as Record<string, any>)[
              iconName
                .split("-")
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join("")
            ];

            return (
              <Button
                type="button"
                key={iconName}
                variant={value === iconName ? "secondary" : "ghost"}
                className={cn(
                  "h-16 [&_svg]:size-16 my-4",
                  value === iconName && "border"
                )}
                onClick={() => onSelect(iconName)}
              >
                {IconComponent ? (
                  <IconComponent strokeWidth={1.5} className="text-ink-strong" />
                ) : (
                  <span className="text-xs">{iconName}</span>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
