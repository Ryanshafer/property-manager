/**
 * This prototype component is designed for rapid iteration.
 * When moving to production:
 * - Replace mock data imports with API hooks or GraphQL queries.
 * - Extract shared layout (e.g., BottomSheet) into reusable hooks.
 * - Move map state management into a context provider if global state is needed.
 */
import { useMemo, useState, type ComponentType } from "react";
import * as LucideIcons from "lucide-react";
import { Copy } from "lucide-react";
import propertyCare from "@/data/propertyCare.json";
import { Button } from "@/components/ui/button";
import SegmentedControl from "@/components/SegmentedControl";
import type { PropertyCareCategory } from "@/features/types";

type PropertyAddress = {
  propertyName: string;
  line1: string;
  line2: string;
  mapUrl?: string;
};

const propertyCareData = propertyCare as {
  address: PropertyAddress;
  categories: PropertyCareCategory[];
};

const getIcon = (iconName: string) => {
  const registry = LucideIcons as Record<string, unknown>;
  const iconCandidate = registry[iconName];
  if (
    iconCandidate &&
    typeof iconCandidate === "object" &&
    "displayName" in iconCandidate
  ) {
    return iconCandidate as ComponentType<{ className?: string }>;
  }
  if (typeof iconCandidate === "function") {
    return iconCandidate as ComponentType<{ className?: string }>;
  }
  return LucideIcons.Sparkles;
};

const SectionPropertyCare = () => {
  const [activeCategory, setActiveCategory] = useState(propertyCareData.categories[0]?.id);
  const [copied, setCopied] = useState(false);

  const activeContent = useMemo(
    () => propertyCareData.categories.find((category) => category.id === activeCategory),
    [activeCategory],
  );

  const handleCopyAddress = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${propertyCareData.address.line1}, ${propertyCareData.address.line2}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="mx-auto flex h-full max-w-md flex-col gap-6 px-4 pb-24 pt-8 text-slate-900">
      <header className="space-y-1">
        <h2 className="text-4xl font-bold leading-tight text-neutral-950">
          Property Care
        </h2>
        <p className="text-base text-neutral-500">
          Contact us if you have any questions about how best to care for our property.
        </p>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Property address:</p>
            <p className="text-xl font-semibold text-neutral-900">{propertyCareData.address.propertyName}</p>
            <p className="text-sm text-neutral-500">
              {propertyCareData.address.line1}
              <br />
              {propertyCareData.address.line2}
            </p>
          </div>
          <Button
            type="button"
            onClick={handleCopyAddress}
            size="icon"
            variant="secondary"
            className="h-11 w-11 rounded-full border border-slate-200 bg-white text-slate-800"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        {copied ? <p className="mt-2 text-xs font-semibold text-emerald-600">Address copied</p> : null}
      </div>

      <SegmentedControl
        options={propertyCareData.categories.map((category) => ({
          id: category.id,
          label: category.label,
        }))}
        value={activeCategory}
        onChange={setActiveCategory}
      />

      <div className="space-y-4">
        {activeContent?.items.map((item) => {
          const IconComponent = getIcon(activeContent.icon);
          return (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"
            >
              <span className={`flex h-15 w-15 min-h-[3.75rem] min-w-[3.75rem] items-center justify-center rounded-full ${activeContent.accent.iconBg}`}>
                <IconComponent className={`h-5 w-5 ${activeContent.accent.iconColor}`} />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
                <p className="text-sm text-neutral-600">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SectionPropertyCare;
