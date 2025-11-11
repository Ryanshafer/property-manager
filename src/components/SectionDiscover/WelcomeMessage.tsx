import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeContent {
  heroImage: string;
  host: {
    name: string;
    title: string;
    avatar: string;
  };
  greeting: string;
  body: string[];
  ctaLabel: string;
}

interface WelcomeMessageProps {
  content: WelcomeContent;
  onDismiss: () => void;
  onCta: () => void;
}

const LANGUAGES = [
  { code: "de", phrase: "Sprache wählen", flag: "🇩🇪" },
  { code: "en", phrase: "Select language", flag: "🇺🇸" },
  { code: "es", phrase: "Elige idioma", flag: "🇪🇸" },
  { code: "it", phrase: "Seleziona lingua", flag: "🇮🇹" },
  { code: "fr", phrase: "Sélectionner la langue", flag: "🇫🇷" },
];

const WelcomeMessage = ({ content, onDismiss, onCta }: WelcomeMessageProps) => {
  const [languageSelected, setLanguageSelected] = useState<string | null>(null);

  const handleLanguageSelect = (code: string) => {
    setLanguageSelected(code);
  };

  return (
    <div className="m-4 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5">
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={content.heroImage}
          alt="Welcome hero"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-lg transition hover:bg-white"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close welcome message</span>
        </button>
      </div>

      {languageSelected ? (
        <div className="space-y-4 px-5 pb-6 pt-5">
          <div className="rounded-xl bg-amber-100 px-5 pb-6 pt-5 text-slate-900">
            <div className="mb-3 flex flex-col items-center text-center">
              <img
                src={content.host.avatar}
                alt={content.host.name}
                className="mb-3 h-20 w-20 rounded-full border-2 border-white object-cover shadow"
                loading="lazy"
              />
            </div>
            <p className="text-base font-medium text-center leading-relaxed">
              {content.greeting}
            </p>
            {content.body.map((paragraph, idx) => (
              <p
                key={paragraph.slice(0, 12) + idx}
                className="mt-3 text-base leading-relaxed text-center text-slate-700"
              >
                {paragraph}
              </p>
            ))}
          </div>
          <Button
            type="button"
            onClick={onCta}
            className="h-auto w-full rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-500/90"
          >
            {content.ctaLabel}
          </Button>
        </div>
      ) : (
        <div className="space-y-3 px-5 pb-6 pt-5">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => handleLanguageSelect(language.code)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-base font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              aria-label={`Select ${language.phrase}`}
            >
              {language.phrase}
              <span className="text-xl" role="img" aria-hidden>
                {language.flag}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export type { WelcomeContent };
export default WelcomeMessage;
