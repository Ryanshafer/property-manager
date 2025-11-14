import { useEffect, useState } from "react";

import Fieldset from "@/components/nodes/Fieldset";
import FormRow from "@/components/nodes/FormRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Assistance, User } from "@/features/admin/types";
import { MoreVertical, Plus } from "lucide-react";

export type AssistanceFormProps = {
  value: Assistance;
  onChange: (assistance: Assistance) => void;
  readOnly?: boolean;
  users?: User[];
};

type AssistanceContact = Assistance["contacts"][number];

const AssistanceForm = ({ value, onChange, readOnly, users }: AssistanceFormProps) => {
  const [recentlyAddedMarker, setRecentlyAddedMarker] = useState<number | null>(null);

  useEffect(() => {
    if (!recentlyAddedMarker) return;
    const timer = window.setTimeout(() => setRecentlyAddedMarker(null), 350);
    return () => window.clearTimeout(timer);
  }, [recentlyAddedMarker]);

  const handleContactChange = (index: number, patch: Partial<AssistanceContact>) => {
    const contacts = [...value.contacts];
    contacts[index] = { ...contacts[index], ...patch };
    onChange({ contacts });
  };

  const handleRemove = (index: number) => {
    if (readOnly) return;
    onChange({ contacts: value.contacts.filter((_, idx) => idx !== index) });
  };

  const handleAdd = () => {
    if (readOnly) return;
    const newContact: AssistanceContact = {
      role: "New contact",
      name: "",
      phone: "",
      email: "",
      notes: "",
      userId: undefined,
    };
    onChange({
      contacts: [newContact, ...value.contacts],
    });
    setRecentlyAddedMarker(Date.now());
  };

  const getPreferredChannel = (channels: User["channels"], types: string[]) => {
    const prioritized = channels.find((channel) => types.includes(channel.type) && channel.primary);
    return prioritized ?? channels.find((channel) => types.includes(channel.type));
  };

  const handleUserSelect = (index: number, selection: string) => {
    if (selection === "custom" || !users?.length) {
      handleContactChange(index, { userId: undefined });
      return;
    }
    const selectedUser = users.find((user) => user.id === selection);
    if (!selectedUser) return;
    const phoneChannel = getPreferredChannel(selectedUser.channels, ["phone", "whatsapp", "sms"]);
    const emailChannel = getPreferredChannel(selectedUser.channels, ["email"]);
    handleContactChange(index, {
      userId: selectedUser.id,
      role: selectedUser.role,
      name: selectedUser.name,
      phone: phoneChannel?.value ?? "",
      email: emailChannel?.value ?? "",
    });
  };

  const contacts = value.contacts ?? [];
  const hasUsers = Boolean(users?.length);
  const usedUserIds = contacts.map((contact) => contact.userId).filter(Boolean) as string[];

  return (
    <Fieldset
      title="Client assistance"
      description="Define who is on-call for guests and how to reach them during each stay."
      action={
        !readOnly
          ? {
              label: "Add contact",
              icon: <Plus className="h-4 w-4" />,
              onClick: handleAdd,
            }
          : undefined
      }
      contentClassName="space-y-4"
    >
      {contacts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center text-sm text-ink-muted">
          No client assistance contacts yet. Add your first teammate to get started.
        </div>
      )}

        {contacts.map((contact, index) => (
          <Fieldset
            key={`${contact.role}-${index}`}
            className={recentlyAddedMarker && index === 0 ? "animate-card-enter" : undefined}
          title={contact.role || `Contact ${index + 1}`}
          description="Operations & support team"
          actions={
            !readOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 border border-border">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-destructive" onClick={() => handleRemove(index)}>
                    Remove contact
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        >
          <FormRow label="Assign teammate" description="Select a teammate to prefill their contact details.">
            <Select
              value={contact.userId ?? "custom"}
              onValueChange={(selection) => handleUserSelect(index, selection)}
              disabled={readOnly || !hasUsers}
            >
              <SelectTrigger>
                <SelectValue placeholder={hasUsers ? "Select teammate" : "No teammates available"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom contact</SelectItem>
                {users?.map((user) => (
                  <SelectItem
                    key={user.id}
                    value={user.id}
                    disabled={contact.userId !== user.id && usedUserIds.includes(user.id)}
                  >
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          {!contact.userId && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <FormRow label="Role">
                  <Input
                    value={contact.role}
                    onChange={(event) => handleContactChange(index, { role: event.target.value })}
                    disabled={readOnly}
                  />
                </FormRow>
                <FormRow label="Name">
                  <Input
                    value={contact.name}
                    onChange={(event) => handleContactChange(index, { name: event.target.value })}
                    disabled={readOnly}
                  />
                </FormRow>
                <FormRow label="Phone">
                  <Input
                    value={contact.phone || ""}
                    onChange={(event) => handleContactChange(index, { phone: event.target.value })}
                    disabled={readOnly}
                  />
                </FormRow>
                <FormRow label="Email">
                  <Input
                    value={contact.email || ""}
                    onChange={(event) => handleContactChange(index, { email: event.target.value })}
                    disabled={readOnly}
                  />
                </FormRow>
              </div>
              <FormRow label="Notes">
                <Input
                  value={contact.notes || ""}
                  onChange={(event) => handleContactChange(index, { notes: event.target.value })}
                  disabled={readOnly}
                />
              </FormRow>
            </>
          )}
        </Fieldset>
      ))}
    </Fieldset>
  );
};

export default AssistanceForm;
