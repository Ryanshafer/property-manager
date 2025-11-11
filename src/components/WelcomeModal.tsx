/**
 * This prototype component is designed for rapid iteration.
 * When moving to production:
 * - Replace mock data imports with API hooks or GraphQL queries.
 * - Extract shared layout (e.g., BottomSheet) into reusable hooks.
 * - Move map state management into a context provider if global state is needed.
 */
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import WelcomeMessage from "./SectionDiscover/WelcomeMessage";
import type { WelcomeContent } from "./SectionDiscover/WelcomeMessage";
import welcomeContent from "@/data/welcome.json";

type WelcomeModalProps = {
  open: boolean;
  onDismiss: () => void;
};

const WelcomeModal = ({ open, onDismiss }: WelcomeModalProps) => {
  const content = welcomeContent as WelcomeContent;
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onDismiss()}>
      <DialogContent className="max-w-md border-0 bg-transparent p-0 shadow-none [&>button:last-child]:hidden">
        <DialogTitle className="sr-only">Welcome message</DialogTitle>
        <DialogDescription className="sr-only">
          Host greeting and onboarding tips for Villa Agrumeto.
        </DialogDescription>
        <WelcomeMessage content={content} onDismiss={onDismiss} onCta={onDismiss} />
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
