/**
 * This prototype component is designed for rapid iteration.
 * When moving to production:
 * - Replace mock data imports with API hooks or GraphQL queries.
 * - Extract shared layout (e.g., BottomSheet) into reusable hooks.
 * - Move map state management into a context provider if global state is needed.
 */
import { MessageCircle, Phone, Mail, Sparkles, Clock, Siren } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import assistance from "@/data/assistance.json";
import type { AssistanceConfig } from "@/features/types";

const assistanceConfig = assistance as AssistanceConfig;

const SectionAssistance = () => {
  return (
    <section className="mx-auto flex h-full max-w-md flex-col gap-6 px-4 pb-24 pt-8 text-slate-900">
      <header>
        <h2 className="text-4xl font-bold leading-tight text-neutral-950">
          Assistance
        </h2>
        <p className="text-base text-neutral-500">
          We're here to help! Don't hesitate to reach out.
        </p>
      </header>

      {assistanceConfig.emergency ? (
        <Button
          className="h-12 justify-center rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100"
          variant="secondary"
          size="lg"
          asChild
        >
          <a
            href={assistanceConfig.emergency.action}
            className="flex w-full items-center justify-center gap-2"
          >
            <Siren className="h-4 w-4" />
            <span>
              {assistanceConfig.emergency.label} {assistanceConfig.emergency.value}
            </span>
          </a>
        </Button>
      ) : null}

      <div className="space-y-5">
        {assistanceConfig.contacts.map((contact) => (
          <Card key={contact.id} className="rounded-2xl border border-slate-200 bg-white shadow-lg">
            <CardContent className="space-y-4 px-5 py-6">
              <div className="flex items-start gap-4">
                <img
                  src={contact.photo}
                  alt={contact.name}
                  className="h-20 w-20 rounded-full object-cover shadow"
                  loading="lazy"
                />
                <div className="flex-1 space-y-0">
                  <span className="inline-flex items-center rounded-sm border border-neutral-300 px-2 py-0.5 text-xs font-base text-neutral-500">
                    {contact.role}
                  </span>
                  <h3 className="text-2xl font-bold text-neutral-950">{contact.name}</h3>
                  <div className="flex items-center gap-2 text-base text-neutral-400">
                    <Clock className="h-4 w-4" />
                    <span>{contact.availability}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {contact.channels.map((channel) => {
                  const icon =
                    channel.type === "whatsapp" ? (
                      <MessageCircle className="h-4 w-4" />
                    ) : channel.type === "phone" ? (
                      <Phone className="h-4 w-4" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    );
                  return (
                    <Button
                      key={`${contact.id}-${channel.type}`}
                      asChild
                      variant={channel.primary ? "default" : "secondary"}
                      size="lg"
                      className={`h-11 gap-3 rounded-full px-5 text-sm font-semibold ${
                        channel.primary
                          ? "bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      <a href={channel.action} className="flex w-full items-center justify-center gap-2">
                        {icon}
                        <span>
                          {channel.label} {channel.value}
                        </span>
                      </a>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-dashed border-slate-300 bg-slate-50/80">
        <CardContent className="space-y-2 px-5 py-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.2em]">Concierge tips</p>
          </div>
          <ul className="list-disc space-y-1 pl-4 text-sm text-slate-600">
            {assistanceConfig.supportTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
};

export default SectionAssistance;
