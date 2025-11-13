import ArrayField from "@/components/nodes/ArrayField";
import Fieldset from "@/components/nodes/Fieldset";
import FormRow from "@/components/nodes/FormRow";
import { Input } from "@/components/ui/input";
import type { Welcome } from "@/features/admin/types";

export type WelcomeFormProps = {
  value: Welcome;
  onChange: (welcome: Welcome) => void;
  readOnly?: boolean;
};

const WelcomeForm = ({ value, onChange, readOnly }: WelcomeFormProps) => {
  const handleChange = (key: keyof Welcome, fieldValue: unknown) => {
    onChange({ ...value, [key]: fieldValue } as Welcome);
  };

  return (
    <div className="space-y-6">
      <Fieldset title="Hero" description="Update the cover image, host, and hero message.">
        <FormRow label="Hero image URL" description="Public https link to your media.">
          {/* TODO(files): Real image uploads */}
          <Input value={value.heroImage} onChange={(event) => handleChange("heroImage", event.target.value)} disabled={readOnly} />
        </FormRow>
        <div className="grid gap-4 md:grid-cols-3">
          <FormRow label="Host name">
            <Input
              value={value.host.name}
              onChange={(event) => handleChange("host", { ...value.host, name: event.target.value })}
              disabled={readOnly}
            />
          </FormRow>
          <FormRow label="Host title">
            <Input
              value={value.host.title || ""}
              onChange={(event) => handleChange("host", { ...value.host, title: event.target.value })}
              disabled={readOnly}
            />
          </FormRow>
          <FormRow label="Host avatar URL">
            <Input
              value={value.host.avatar || ""}
              onChange={(event) => handleChange("host", { ...value.host, avatar: event.target.value })}
              disabled={readOnly}
            />
          </FormRow>
        </div>
      </Fieldset>
      <Fieldset title="Copy" description="Customize the welcome copy and CTA.">
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
        <FormRow label="CTA label">
          <Input value={value.ctaLabel || ""} onChange={(event) => handleChange("ctaLabel", event.target.value)} disabled={readOnly} />
        </FormRow>
      </Fieldset>
    </div>
  );
};

export default WelcomeForm;
