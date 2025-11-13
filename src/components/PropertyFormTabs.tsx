import { useState, type FC, type ReactElement } from "react";

import AssistanceForm from "@/components/nodes/AssistanceForm";
import DiscoverForm from "@/components/nodes/DiscoverForm";
import PropertyCareForm from "@/components/nodes/PropertyCareForm";
import RulesForm from "@/components/nodes/RulesForm";
import WelcomeForm from "@/components/nodes/WelcomeForm";
import WifiForm from "@/components/nodes/WifiForm";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Property } from "@/features/admin/types";
import { Trash2 } from "lucide-react";

export interface PropertyFormTabsProps {
  value: Property;
  onNodeChange: <K extends keyof Property>(node: K, data: Property[K]) => void;
  onDeleteRequest: () => void;
  readOnly?: boolean;
  canDelete?: boolean;
}

type TabRenderArgs = {
  property: Property;
  onChange: PropertyFormTabsProps["onNodeChange"];
  onDeleteRequest: () => void;
  readOnly?: boolean;
  canDelete?: boolean;
};

const tabs: Array<{
  id: string;
  label: string;
  render: (args: TabRenderArgs) => ReactElement;
}> = [
  {
    id: "welcome",
    label: "Welcome",
    render: ({ property, onChange, readOnly }) => (
      <WelcomeForm value={property.welcome} onChange={(data) => onChange("welcome", data)} readOnly={readOnly} />
    ),
  },
  {
    id: "rules",
    label: "Rules",
    render: ({ property, onChange, readOnly }) => (
      <RulesForm value={property.rules} onChange={(data) => onChange("rules", data)} readOnly={readOnly} />
    ),
  },
  {
    id: "wifi",
    label: "Wi-Fi",
    render: ({ property, onChange, readOnly }) => (
      <WifiForm value={property.wifi} onChange={(data) => onChange("wifi", data)} readOnly={readOnly} />
    ),
  },
  {
    id: "discover",
    label: "Discover",
    render: ({ property, onChange, readOnly }) => (
      <DiscoverForm
        value={property.discover}
        coordinates={property.coordinates}
        location={property.location}
        onChange={(data) => onChange("discover", data)}
        readOnly={readOnly}
      />
    ),
  },
  {
    id: "assistance",
    label: "Assistance",
    render: ({ property, onChange, readOnly }) => (
      <AssistanceForm value={property.assistance} onChange={(data) => onChange("assistance", data)} readOnly={readOnly} />
    ),
  },
  {
    id: "care",
    label: "Property care",
    render: ({ property, onChange, readOnly }) => (
      <PropertyCareForm value={property.propertyCare} onChange={(data) => onChange("propertyCare", data)} readOnly={readOnly} />
    ),
  },
  {
    id: "danger",
    label: "Danger zone",
    render: ({ property, onDeleteRequest, readOnly, canDelete }) => (
      <div className="space-y-4 text-destructive">
        <div>
          <p className="text-lg font-semibold">Danger zone</p>
          <p className="text-sm text-destructive/80">
            Deleting {property.name} removes every node from this session. Export data and notify your team before continuing.
          </p>
        </div>
        {!readOnly && canDelete && (
          <Button variant="destructive" onClick={onDeleteRequest}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete property
          </Button>
        )}
      </div>
    ),
  },
];

const PropertyFormTabs: FC<PropertyFormTabsProps> = ({
  value,
  onNodeChange,
  onDeleteRequest,
  readOnly,
  canDelete,
}) => {
  const [activeTab, setActiveTab] = useState("welcome");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="space-y-6">
      <div className="md:hidden">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger>
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab.id} value={tab.id}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <TabsList
          className="hidden rounded-2xl border border-border bg-card p-2 md:flex md:!h-auto md:w-56 md:flex-col md:gap-2"
          aria-orientation="vertical"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="w-full justify-start rounded-xl px-3 py-2 text-sm font-medium text-ink-muted transition data-[state=active]:bg-secondary data-[state=active]:text-ink-strong"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 space-y-6">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="mt-0 rounded-2xl border border-border bg-card/80 p-4 shadow-sm md:p-6"
            >
              {tab.render({ property: value, onChange: onNodeChange, onDeleteRequest, readOnly, canDelete })}
            </TabsContent>
          ))}
        </div>
      </div>
    </Tabs>
  );
};

export default PropertyFormTabs;
