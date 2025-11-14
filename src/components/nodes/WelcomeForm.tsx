import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";

import ArrayField from "@/components/nodes/ArrayField";
import Fieldset from "@/components/nodes/Fieldset";
import FormRow from "@/components/nodes/FormRow";
import PhotoUploadDialog from "@/components/nodes/PhotoUploadDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, Welcome } from "@/features/admin/types";

export type WelcomeFormProps = {
  value: Welcome;
  onChange: (welcome: Welcome) => void;
  readOnly?: boolean;
  users?: User[];
};

const WelcomeForm = ({ value, onChange, readOnly, users }: WelcomeFormProps) => {
  const [heroDialogOpen, setHeroDialogOpen] = useState(!value.heroImage);

  const handleChange = (key: keyof Welcome, fieldValue: unknown) => {
    onChange({ ...value, [key]: fieldValue } as Welcome);
  };

  useEffect(() => {
    if (!value.heroImage) {
      setHeroDialogOpen(true);
    }
  }, [value.heroImage]);

  const selectedGreeterId = useMemo(() => users?.find((user) => user.name === value.host.name)?.id, [users, value.host.name]);

  const handleGreeterSelect = (userId: string) => {
    const selected = users?.find((user) => user.id === userId);
    if (!selected) return;
    handleChange("host", {
      name: selected.name,
      title: selected.role,
      avatar: selected.photo,
    });
  };

  const heroImage = value.heroImage?.trim();

  return (
    <div className="space-y-6">
      <Fieldset title="Welcome image" description="Update the welcome image, host, and greeting.">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-muted">
            {heroImage ? (
              <img src={heroImage} alt={value.host.name || "Welcome image"} className="h-64 w-full object-cover" />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-ink-muted">Add a welcome image to greet guests</div>
            )}
            {!readOnly && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-4 top-4 h-9 w-9 rounded-full shadow"
                onClick={() => setHeroDialogOpen(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Fieldset>
      <Fieldset title="Welcome message" description="Customize the welcome messsage and button.">
        <FormRow label="Greeting host" description="Assign a user to author this message.">
          <Select value={selectedGreeterId ?? undefined} onValueChange={handleGreeterSelect} disabled={readOnly || !users?.length}>
            <SelectTrigger>
              <SelectValue placeholder={value.host.name || (users?.length ? "Select a teammate" : "No teammates available")} />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>
        <FormRow label="Greeting">
          <Input value={value.greeting} onChange={(event) => handleChange("greeting", event.target.value)} disabled={readOnly} />
        </FormRow>
        <ArrayField
          label="Paragraphs"
          values={value.body}
          multiline
          placeholder="Write one paragraph at a time"
          onChange={(body) => handleChange("body", body)}
          disabled={readOnly}
        />
        <FormRow label="Button action text">
          <Input value={value.ctaLabel || ""} onChange={(event) => handleChange("ctaLabel", event.target.value)} disabled={readOnly} />
        </FormRow>
      </Fieldset>
      <PhotoUploadDialog
        open={heroDialogOpen && !readOnly}
        onOpenChange={setHeroDialogOpen}
        title="Update welcome image"
        description="Upload an image or drag and drop a file to preview."
        initialUrl={value.heroImage || null}
        disabled={readOnly}
        saveLabel="Save welcome image"
        onSave={(next) => {
          if (readOnly || !next) return;
          handleChange("heroImage", next);
        }}
      />
    </div>
  );
};

export default WelcomeForm;
