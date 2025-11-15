import { useState, useMemo, useEffect, type ReactElement } from "react";

import Fieldset from "@/components/nodes/Fieldset";
import FormRow from "@/components/nodes/FormRow";
import IconPicker from "@/components/IconPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Rule } from "@/features/admin/types";
import { MoreVertical, PencilLine, Plus } from "lucide-react";
import * as lucideIcons from "lucide-react";

export type RulesFormProps = {
  value: Rule[];
  onChange: (rules: Rule[]) => void;
  readOnly?: boolean;
};

const pascalCase = (icon?: string) =>
  icon
    ?.split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const RuleIconSelector = ({
  value,
  onSelect,
  children,
  disabled,
}: {
  value?: string;
  onSelect: (icon: string) => void;
  children: ReactElement;
  disabled?: boolean;
}) => {
  if (disabled) {
    return children;
  }
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pick an icon</DialogTitle>
          <DialogDescription>Select an icon to associate with this rule.</DialogDescription>
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

const RulesForm = ({ value, onChange, readOnly }: RulesFormProps) => {
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (!recentlyAddedId) return;
    const timer = window.setTimeout(() => setRecentlyAddedId(null), 350);
    return () => window.clearTimeout(timer);
  }, [recentlyAddedId]);

  const handleRuleChange = (index: number, patch: Partial<Rule>) => {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const handleRemove = (index: number) => {
    if (readOnly) return;
    onChange(value.filter((_, idx) => idx !== index));
  };

  const handleAdd = () => {
    if (readOnly) return;
    const newRule: Rule = {
      id: `rule-${Date.now().toString(36)}`,
      title: "New rule",
      details: "Details",
      icon: "info",
    };
    onChange([newRule, ...value]);
    setRecentlyAddedId(newRule.id);
  };

  return (
    <Fieldset
      title="House rules"
      description="Keep property expectations up to date so guests understand how to care for the space."
      action={
        !readOnly
          ? {
              label: "Add rule",
              icon: <Plus className="h-4 w-4" />,
              onClick: handleAdd,
            }
          : undefined
      }
      contentClassName="space-y-4"
    >
      {value.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center text-sm text-ink-muted">
          No rules yet. Add your first rule to set expectations for guests.
        </div>
      )}

      {value.map((rule, index) => {
        const iconName = rule.icon ? pascalCase(rule.icon) : undefined;
        const IconComponent = iconName
          ? (lucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
          : undefined;

        return (
          <Fieldset
            key={rule.id}
            className={recentlyAddedId === rule.id ? "animate-card-enter" : undefined}
            title={rule.title || `Rule ${index + 1}`}
            description="Update the title, icon, and supporting details."
            titleAdornment={
              IconComponent ? (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-ink-strong">
                  <IconComponent className="h-5 w-5" aria-hidden />
                </span>
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-ink-muted">?</span>
              )
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
                      Delete rule
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }
          >
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
              <FormRow label="Title">
                <Input value={rule.title} onChange={(event) => handleRuleChange(index, { title: event.target.value })} disabled={readOnly} />
              </FormRow>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none text-ink-strong">Icon</p>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/20 px-3 py-1">
                  <div className="flex items-center gap-3 text-sm">
                    {IconComponent && <IconComponent className="h-5 w-5" aria-hidden />}
                    <span className="text-ink-strong">{rule.icon || "No icon selected"}</span>
                  </div>
                  <RuleIconSelector value={rule.icon} onSelect={(icon) => handleRuleChange(index, { icon })} disabled={readOnly}>
                    <Button variant="ghost" size="icon" disabled={readOnly}>
                      <PencilLine className="h-4 w-4" />
                    </Button>
                  </RuleIconSelector>
                </div>
              </div>
            </div>
            <FormRow label="Details">
              <Textarea
                value={rule.details}
                onChange={(event) => handleRuleChange(index, { details: event.target.value })}
                rows={4}
                disabled={readOnly}
              />
            </FormRow>
          </Fieldset>
        );
      })}
    </Fieldset>
  );
};

export default RulesForm;
