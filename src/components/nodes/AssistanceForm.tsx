import Fieldset from "@/components/nodes/Fieldset";
import FormRow from "@/components/nodes/FormRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Assistance } from "@/features/admin/types";
import { Plus, Trash2 } from "lucide-react";

export type AssistanceFormProps = {
  value: Assistance;
  onChange: (assistance: Assistance) => void;
  readOnly?: boolean;
};

const AssistanceForm = ({ value, onChange, readOnly }: AssistanceFormProps) => {
  const handleContactChange = (index: number, patch: Record<string, string>) => {
    const contacts = [...value.contacts];
    contacts[index] = { ...contacts[index], ...patch };
    onChange({ contacts });
  };

  const handleRemove = (index: number) => {
    onChange({ contacts: value.contacts.filter((_, idx) => idx !== index) });
  };

  const handleAdd = () => {
    onChange({
      contacts: [
        ...value.contacts,
        {
          role: "New contact",
          name: "",
          phone: "",
          email: "",
        },
      ],
    });
  };

  return (
    <div className="space-y-4">
      {value.contacts.map((contact, index) => (
        <Fieldset key={`${contact.role}-${index}`} title={contact.role || `Contact ${index + 1}`} description="Operations & support team">
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
          <Button variant="ghost" size="sm" onClick={() => handleRemove(index)} disabled={readOnly}>
            <Trash2 className="mr-2 h-4 w-4" /> Remove contact
          </Button>
        </Fieldset>
      ))}
      <Button variant="outline" onClick={handleAdd} disabled={readOnly}>
        <Plus className="mr-2 h-4 w-4" /> Add contact
      </Button>
    </div>
  );
};

export default AssistanceForm;
