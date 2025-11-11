/**
 * This prototype component is designed for rapid iteration.
 * When moving to production:
 * - Replace mock data imports with API hooks or GraphQL queries.
 * - Extract shared layout (e.g., BottomSheet) into reusable hooks.
 * - Move map state management into a context provider if global state is needed.
 */
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Compass,
  ScrollText,
  Headphones,
  Wrench,
  Wifi,
} from "lucide-react";

import SectionDiscover from "./SectionDiscover";
import SectionRules from "./SectionRules";
import SectionAssistance from "./SectionAssistance";
import SectionPropertyCare from "./SectionPropertyCare";
import SectionWifi from "./SectionWifi";
import WelcomeModal from "./WelcomeModal";

type SectionId = "discover" | "rules" | "assistance" | "care" | "wifi";

const SECTIONS: Array<{
  id: SectionId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "discover", label: "Discover", icon: Compass },
  { id: "rules", label: "Rules", icon: ScrollText },
  { id: "assistance", label: "Assistance", icon: Headphones },
  { id: "care", label: "Property", icon: Wrench },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
];

const WELCOME_KEY = "guest-app-welcome-dismissed";

const AppShell = () => {
  const [activeSection, setActiveSection] = useState<SectionId>("discover");
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(WELCOME_KEY);
    if (!dismissed) {
      setWelcomeOpen(true);
    }
  }, []);

  const handleDismissWelcome = () => {
    setWelcomeOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(WELCOME_KEY, "true");
    }
  };

  const renderedSection = useMemo(() => {
    switch (activeSection) {
      case "rules":
        return <SectionRules />;
      case "assistance":
        return <SectionAssistance />;
      case "care":
        return <SectionPropertyCare />;
      case "wifi":
        return <SectionWifi />;
      case "discover":
      default:
        return <SectionDiscover />;
    }
  }, [activeSection]);

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <WelcomeModal open={welcomeOpen} onDismiss={handleDismissWelcome} />
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            className="h-full"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {renderedSection}
          </motion.div>
        </AnimatePresence>
      </div>
      <nav className="sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = id === activeSection;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;

/**
 * Testing notes:
 * - Test sheet drag and section switching on mobile viewport.
 * - Verify localStorage persistence for welcome modal.
 * - Check map marker touch behavior across Safari and Chrome mobile.
 */
