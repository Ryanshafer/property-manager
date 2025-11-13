import { memo, useMemo, useState } from "react";
import icons from "@/data/lucide-icons.json";
import * as lucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LucideIconComponent = LucideIcon;

export type IconPickerProps = {
  value?: string;
  onSelect: (icon: string) => void;
};

const iconComponentCache: Record<string, LucideIconComponent | undefined> = {};

const toPascalCase = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const isLucideIcon = (value: unknown): value is LucideIconComponent => typeof value === "function";

const resolveIconComponent = (name: string): LucideIconComponent | undefined => {
  if (iconComponentCache[name]) return iconComponentCache[name];
  const pascalName = toPascalCase(name);
  const entry = (lucideIcons as Record<string, unknown>)[pascalName];
  const component = isLucideIcon(entry) ? entry : undefined;
  iconComponentCache[name] = component;
  return component;
};

const IconPickerComponent = ({ value, onSelect }: IconPickerProps) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return icons;
    return icons.filter((name) => name.toLowerCase().includes(trimmed));
  }, [query]);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search icons"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search icons"
      />
      <div className="h-[460px] overflow-y-auto rounded-xl border border-border">
        <div className="grid grid-cols-4 gap-2 p-2">
          {filtered.map((iconName) => {
            const IconComponent = resolveIconComponent(iconName);
            const isActive = value === iconName;
            return (
              <Button
                type="button"
                key={iconName}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("my-4 h-16 [&_svg]:h-16 [&_svg]:w-16", isActive && "border border-border")}
                onClick={() => onSelect(iconName)}
                aria-pressed={isActive}
              >
                {IconComponent ? (
                  <IconComponent strokeWidth={1.5} className="h-6 w-6 text-ink-strong" />
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

const IconPicker = memo(IconPickerComponent);
IconPicker.displayName = "IconPicker";

export default IconPicker;
