import { Building, Mail, MessageCircle, Phone } from "lucide-react";
import { memo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ContactChannelType, Property, User, Weekday } from "@/features/admin/types";

const dayLabels: Record<Weekday, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

const ALL_DAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const formatAvailability = (availability: User["availability"]) => {
  if (availability.always) {
    return "Available at all times";
  }

  const timeRange = `${availability.start || "00:00"}–${availability.end || "23:59"}`;

  const isDaily = availability.days.length === ALL_DAYS.length && ALL_DAYS.every((day) => availability.days.includes(day));
  const isWeekdays = availability.days.length === 5 && ["mon", "tue", "wed", "thu", "fri"].every((day) => availability.days.includes(day as Weekday));
  let dayString = "";
  if (isDaily) {
    dayString = "Daily";
  } else if (isWeekdays) {
    dayString = "Mon–Fri";
  } else {
    dayString = availability.days.map((day) => dayLabels[day as Weekday]).join(", ");
  }

  return `${timeRange} · ${dayString}`;
};

const channelIconMap: Record<ContactChannelType, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
  sms: MessageCircle,
};

const ACCESS_LEVEL_STYLES: Record<User["accessLevel"], { label: string; tone: string }> = {
  admin: { label: "Admin", tone: "bg-emerald-100 text-emerald-900" },
  editor: { label: "Editor", tone: "bg-blue-100 text-blue-900" },
  viewer: { label: "Viewer", tone: "bg-slate-100 text-slate-900" },
};

type UserCardProps = {
  user: User;
  properties: Property[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  canEdit?: boolean;
};

const getInitials = (name?: string) =>
  name
    ? name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "LG";

const UserCardComponent = ({ user, properties, onEdit, onDelete, canEdit = true }: UserCardProps) => {
  const access = ACCESS_LEVEL_STYLES[user.accessLevel];
  const managedProperties = (user.managedPropertyIds ?? [])
    ?.map((propertyId) => properties.find((property) => property.id === propertyId)?.name)
    .filter(Boolean) as string[];

  return (
    <Card className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {user.photo ? <AvatarImage src={user.photo} alt={user.name} className="object-cover" /> : null}
            <AvatarFallback className="bg-muted text-sm font-semibold text-ink-strong">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-ink-strong">{user.name}</p>
              <Badge className={access?.tone || "bg-muted text-ink-strong"}>{access?.label ?? user.accessLevel}</Badge>
            </div>
            <p className="text-sm text-ink-muted">{user.role}</p>
            {user.availability && <p className="text-sm text-ink-muted/80">{formatAvailability(user.availability)}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Contact methods</p>
        <div className="space-y-2">
          {user.channels.map((channel) => {
            const Icon = channelIconMap[channel.type as ContactChannelType] ?? MessageCircle;
            const content = (
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-ink-muted" />
                <span className="font-medium text-ink-strong">{channel.label}</span>
                <span className="text-ink-muted">{channel.value}</span>
              </div>
            );

            if (channel.type === "email" && channel.action) {
              return (
                <a
                  key={`${channel.type}-${channel.value}`}
                  href={channel.action}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/30 px-3 py-2 text-sm transition hover:bg-muted/60"
                >
                  {content}
                  {channel.primary && <Badge variant="secondary">Primary</Badge>}
                </a>
              );
            }

            return (
              <div
                key={`${channel.type}-${channel.value}`}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/30 px-3 py-2 text-sm"
              >
                {content}
                {channel.primary && <Badge variant="secondary">Primary</Badge>}
              </div>
            );
          })}
          {user.channels.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/70 px-3 py-2 text-sm text-ink-muted">
              No channels added
            </div>
          )}
        </div>
      </div>

      {managedProperties.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Managed properties</p>
          <div className="flex flex-wrap gap-2">
            {managedProperties.map((name) => (
              <Badge key={name} variant="outline" className="gap-1 text-ink-muted">
                <Building className="h-3 w-3" />
                {name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {canEdit && (
        <Button
          variant="default"
          size="lg"
          className="w-full justify-center text-base font-semibold"
          onClick={() => onEdit(user)}
        >
          View user
        </Button>
      )}
    </Card>
  );
};

const UserCard = memo(UserCardComponent);
UserCard.displayName = "UserCard";

export default UserCard;
