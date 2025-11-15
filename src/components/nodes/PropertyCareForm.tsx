import { useEffect, useState } from "react";

import Fieldset from "@/components/nodes/Fieldset";
import IconPicker from "@/components/IconPicker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PropertyCare } from "@/features/admin/types";
import { MoreVertical, PencilLine, Plus } from "lucide-react";
import * as lucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type PropertyCareFormProps = {
  value: PropertyCare;
  onChange: (care: PropertyCare) => void;
  readOnly?: boolean;
};

const pascalCase = (icon?: string) =>
  icon
    ?.split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const isLucideIcon = (component: unknown): component is LucideIcon => typeof component === "function";

const resolveLucideIcon = (icon?: string): LucideIcon | undefined => {
  if (!icon) return undefined;
  const name = pascalCase(icon);
  if (!name) return undefined;
  const entry = (lucideIcons as Record<string, unknown>)[name];
  return isLucideIcon(entry) ? entry : undefined;
};

const PRESET_SECTIONS = [
  { id: "general", label: "General", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  { id: "house", label: "House", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  { id: "checkout", label: "Checkout", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { id: "problems", label: "Problems", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
];

const IconPickerTrigger = ({ value, onSelect, disabled }: { value?: string; onSelect: (icon: string) => void; disabled?: boolean }) => {
  if (disabled) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <PencilLine className="h-4 w-4" />
      </Button>
    );
  }
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pick an icon</DialogTitle>
        </DialogHeader>
        <IconPicker
          value={value}
          onSelect={(icon) => {
            onSelect(icon);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

type LegacyGuideline = PropertyCare["guidelines"][number] & {
  items?: Array<{ title: string; description: string }>;
};

const hasLegacyItems = (guideline: PropertyCare["guidelines"][number]): guideline is LegacyGuideline =>
  Array.isArray((guideline as LegacyGuideline).items);

const PropertyCareForm = ({ value, onChange, readOnly }: PropertyCareFormProps) => {
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (!recentlyAddedId) return;
    const timer = window.setTimeout(() => setRecentlyAddedId(null), 350);
    return () => window.clearTimeout(timer);
  }, [recentlyAddedId]);

  useEffect(() => {
    const needsMigration = value.guidelines.some(hasLegacyItems);
    if (!needsMigration) return;

    const migrated = value.guidelines
      .flatMap((guideline) => {
        if (!hasLegacyItems(guideline) || !guideline.items?.length) {
          return {
            ...guideline,
            title: guideline.title || "Care title",
            description: guideline.description || "Describe the instruction.",
          };
        }

        return guideline.items.map((item, itemIndex) => ({
          id: `${guideline.id}-${itemIndex}`,
          title: item.title,
          description: item.description,
          label: guideline.label,
          icon: guideline.icon,
          accent: guideline.accent,
        }));
      })
      .map(({ items, ...rest }) => rest);

    onChange({ guidelines: migrated });
  }, [onChange, value.guidelines]);

  const handleGuidelinePatch = (index: number, patch: Record<string, unknown>) => {
    const guidelines = [...value.guidelines];
    guidelines[index] = { ...guidelines[index], ...patch };
    if (readOnly) return;
    onChange({ guidelines });
  };

  const handleRemove = (index: number) => {
    if (readOnly) return;
    onChange({ guidelines: value.guidelines.filter((_, idx) => idx !== index) });
  };

  const handleAdd = () => {
    if (readOnly) return;
    const preset = PRESET_SECTIONS[0];
    const newGuideline = {
      id: `guideline-${Date.now().toString(36)}`,
      label: preset.label,
      icon: "sparkles",
      accent: { iconBg: preset.iconBg, iconColor: preset.iconColor },
      title: "Care title",
      description: "Describe the instruction.",
    };
    onChange({
      guidelines: [newGuideline, ...value.guidelines],
    });
    setRecentlyAddedId(newGuideline.id);
  };

  return (
    <Fieldset
      title="Property care"
      description="Document cleaning rituals, maintenance walkthroughs, and any special instructions."
      action={
        !readOnly
          ? {
              label: "Add care note",
              icon: <Plus className="h-4 w-4" />,
              onClick: handleAdd,
            }
          : undefined
      }
      contentClassName="space-y-4"
    >
      {value.guidelines.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center text-sm text-ink-muted">
          No property care guidance yet. Add your first instruction to help stewards care for the space.
        </div>
      )}

        {value.guidelines.map((guideline, index) => {
        const IconComponent = resolveLucideIcon(guideline.icon);

        const selectedPreset = PRESET_SECTIONS.find((preset) => preset.label === guideline.label);

        const accentBg = guideline.accent?.iconBg ?? selectedPreset?.iconBg ?? "bg-muted";
        const accentColor = guideline.accent?.iconColor ?? selectedPreset?.iconColor ?? "text-ink-strong";

        return (
          <Fieldset
            key={guideline.id}
            className={recentlyAddedId === guideline.id ? "animate-card-enter" : undefined}
            title={guideline.title || `Guideline ${index + 1}`}
            description="Provide actionable care instructions for the space."
            titleAdornment={
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full ${accentBg} ${accentColor}`}
              >
                {IconComponent ? <IconComponent className="h-5 w-5" /> : "?"}
              </span>
            }
            actions={
              readOnly ? (
                <Button variant="ghost" size="icon" className="h-9 w-9 border border-border" disabled>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 border border-border">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive" onClick={() => handleRemove(index)}>
                      Delete section
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-ink-strong">Section</p>
                <Select
                  value={selectedPreset?.label || guideline.label || ""}
                  onValueChange={(label) => {
                    if (readOnly) return;
                    const preset = PRESET_SECTIONS.find((item) => item.label === label);
                    if (preset) {
                      handleGuidelinePatch(index, {
                        label: preset.label,
                        accent: { iconBg: preset.iconBg, iconColor: preset.iconColor },
                      });
                    } else {
                      handleGuidelinePatch(index, { label });
                    }
                  }}
                  disabled={readOnly}
                >
                  <SelectTrigger disabled={readOnly}>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_SECTIONS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.label}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none text-ink-strong">Icon</p>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/20 px-3 py-2">
                  <div className="flex items-center gap-3 text-sm">
                    {IconComponent && <IconComponent className="h-5 w-5" aria-hidden />}
                    <span className="text-ink-strong">{guideline.icon || "No icon selected"}</span>
                  </div>
                  <IconPickerTrigger
                    value={guideline.icon}
                    onSelect={(icon) => handleGuidelinePatch(index, { icon })}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4 rounded-2xl border border-border bg-card/60 p-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink-strong">Title</p>
                <Input
                  value={guideline.title}
                  onChange={(event) => handleGuidelinePatch(index, { title: event.target.value })}
                  placeholder="Thermostat"
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink-strong">Description</p>
                <Textarea
                  value={guideline.description}
                  onChange={(event) => handleGuidelinePatch(index, { description: event.target.value })}
                  rows={3}
                  placeholder="Share the care instruction"
                  disabled={readOnly}
                />
              </div>
            </div>
          </Fieldset>
        );
      })}
    </Fieldset>
  );
};

export default PropertyCareForm;
