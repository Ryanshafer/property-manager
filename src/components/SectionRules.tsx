/**
 * This prototype component is designed for rapid iteration.
 * When moving to production:
 * - Replace mock data imports with API hooks or GraphQL queries.
 * - Extract shared layout (e.g., BottomSheet) into reusable hooks.
 * - Move map state management into a context provider if global state is needed.
 */
import type { ComponentType } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Shield } from "lucide-react";
// Temporary mock data — replace with backend response or CMS integration.
import rules from "@/data/rules.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Rule = (typeof rules)[number];

const getIconComponent = (iconName?: string): ComponentType<{ className?: string }> => {
  const registry = LucideIcons as Record<string, unknown>;
  if (!iconName) return Shield;
  const iconCandidate = registry[iconName];
  if (iconCandidate && typeof iconCandidate === "object" && "displayName" in iconCandidate) {
    return iconCandidate as ComponentType<{ className?: string }>;
  }
  if (typeof iconCandidate === "function") {
    return iconCandidate as ComponentType<{ className?: string }>;
  }
  return Shield;
};

const SectionRules = () => {
  return (
    <section className="mx-auto flex h-full max-w-md flex-col gap-4 px-4 pb-24 pt-8 text-slate-900">
      <header className="space-y-2">
        <h2 className="text-4xl font-bold leading-tight text-neutral-950">
          Rental Rules
        </h2>
        <p className="text-base text-neutral-500">
          Please help us maintain a peaceful environment. Our property manager can clarify any
          detail.
        </p>
      </header>
      <motion.div className="grid gap-4">
        {(rules as Rule[]).map((rule, index) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Card className="border border-slate-200 bg-white/90 shadow-sm">
              <CardHeader className="flex flex-row items-start gap-4">
                <span className="flex h-15 w-15 min-h-[3.75rem] min-w-[3.75rem] items-center justify-center rounded-full bg-neutral-300 text-neutral-950">
                  {(() => {
                    const IconComponent = getIconComponent(rule.icon);
                    return <IconComponent className="h-6 w-6" />;
                  })()}
                </span>
                <div>
                  <CardTitle className="text-2xl font-semibold">
                    {rule.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed text-neutral-600">
                    {rule.details}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default SectionRules;
