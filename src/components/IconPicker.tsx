import { memo, useEffect, useMemo, useState } from "react";
import icons from "@/data/lucide-icons.json";
import type { LucideIcon } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LucideIconComponent = LucideIcon;

type LucideIconComponentModule = { default: LucideIconComponent };

export type IconPickerProps = {
  value?: string;
  onSelect: (icon: string) => void;
};

const iconComponentCache: Record<string, LucideIconComponent | null | undefined> = {};
const iconImporters = dynamicIconImports as Record<string, () => Promise<LucideIconComponentModule>>;
const iconListeners: Record<string, Set<() => void>> = {};
const pendingIcons = new Set<string>();
const iconQueue: string[] = [];
let activeIconImports = 0;
const MAX_PARALLEL_ICON_IMPORTS = 8;

const subscribeToIcon = (name: string, callback: () => void) => {
  if (!iconListeners[name]) {
    iconListeners[name] = new Set();
  }
  iconListeners[name]!.add(callback);
  return () => {
    iconListeners[name]?.delete(callback);
    if (iconListeners[name]?.size === 0) {
      delete iconListeners[name];
    }
  };
};

const notifyIconListeners = (name: string) => {
  iconListeners[name]?.forEach((listener) => listener());
};

const enqueueIconImport = (name: string) => {
  if (!name || pendingIcons.has(name) || iconComponentCache[name] !== undefined) {
    return;
  }
  pendingIcons.add(name);
  iconQueue.push(name);
  processIconQueue();
};

const processIconQueue = () => {
  while (activeIconImports < MAX_PARALLEL_ICON_IMPORTS && iconQueue.length) {
    const name = iconQueue.shift();
    if (!name) continue;
    const importer = iconImporters[name];
    if (!importer) {
      iconComponentCache[name] = undefined;
      pendingIcons.delete(name);
      notifyIconListeners(name);
      continue;
    }
    activeIconImports++;
    importer()
      .then((module) => {
        iconComponentCache[name] = module.default as LucideIconComponent;
      })
      .catch(() => {
        iconComponentCache[name] = undefined;
      })
      .finally(() => {
        pendingIcons.delete(name);
        activeIconImports--;
        notifyIconListeners(name);
        processIconQueue();
      });
  }
};
const EXCLUDED_ICON_PATTERNS = [
  /^align-/,
  /^columns?/,
  /^rows?/,
  /^layout/,
  /^panel/,
  /^table/,
  /^separator/,
  /^component/,
  /^slider/,
  /^monitor/,
  /^laptop/,
  /^tablet/,
  /^smartphone/,
  /^mouse/,
  /^touchpad/,
  /^server/,
  /^router/,
  /^keyboard/,
  /^cpu/,
  /^git/,
  /^code/,
  /^braces/,
  /^brackets/,
];

const useIconComponent = (name: string) => {
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!name) return;
    if (iconComponentCache[name] === undefined) {
      enqueueIconImport(name);
    }
    const unsubscribe = subscribeToIcon(name, () => {
      forceRender((count) => count + 1);
    });
    return unsubscribe;
  }, [name]);

  return iconComponentCache[name] ?? null;
};

const IconPickerComponent = ({ value, onSelect }: IconPickerProps) => {
  const [query, setQuery] = useState("");

  const availableIcons = useMemo(
    () => icons.filter((name) => !EXCLUDED_ICON_PATTERNS.some((pattern) => pattern.test(name))),
    [],
  );

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return availableIcons;
    return availableIcons.filter((name) => name.toLowerCase().includes(trimmed));
  }, [query, availableIcons]);

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
          {filtered.map((iconName) => (
            <IconOption key={iconName} name={iconName} isActive={value === iconName} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};

const IconPicker = memo(IconPickerComponent);
IconPicker.displayName = "IconPicker";

export default IconPicker;

const IconOption = ({ name, isActive, onSelect }: { name: string; isActive: boolean; onSelect: (icon: string) => void }) => {
  const IconComponent = useIconComponent(name);
  return (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      className={cn("my-4 h-16 [&_svg]:h-16 [&_svg]:w-16", isActive && "border border-border")}
      onClick={() => onSelect(name)}
      aria-pressed={isActive}
    >
      {IconComponent ? (
        <IconComponent strokeWidth={1.5} className="h-6 w-6 text-ink-strong" />
      ) : (
        <span className="text-xs">{name}</span>
      )}
    </Button>
  );
};
