import ArrayField from "@/components/nodes/ArrayField";
import Fieldset from "@/components/nodes/Fieldset";
import FormRow from "@/components/nodes/FormRow";
import { Input } from "@/components/ui/input";
import type { Wifi } from "@/features/admin/types";

export type WifiFormProps = {
  value: Wifi;
  onChange: (wifi: Wifi) => void;
  readOnly?: boolean;
};

const WifiForm = ({ value, onChange, readOnly }: WifiFormProps) => {
  const handleChange = (key: keyof Wifi, fieldValue: unknown) => {
    onChange({ ...value, [key]: fieldValue } as Wifi);
  };

  return (
    <Fieldset title="Wi-Fi" description="Credentials, notes, and instructions">
      <div className="grid gap-4 md:grid-cols-2">
        <FormRow label="Network name">
          <Input value={value.networkName} onChange={(event) => handleChange("networkName", event.target.value)} disabled={readOnly} />
        </FormRow>
        <FormRow label="Password">
          <Input value={value.password} onChange={(event) => handleChange("password", event.target.value)} disabled={readOnly} />
        </FormRow>
      </div>
      <FormRow label="Share note">
        <Input value={value.shareNote || ""} onChange={(event) => handleChange("shareNote", event.target.value)} disabled={readOnly} />
      </FormRow>
      <ArrayField
        label="Instructions"
        values={value.instructions}
        onChange={(instructions) => handleChange("instructions", instructions)}
        placeholder="e.g. Restart the router from the utility closet"
        disabled={readOnly}
      />
    </Fieldset>
  );
};

export default WifiForm;
