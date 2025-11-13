import { useMemo, useRef, useState } from "react";
import { Clock, MoreVertical, PencilLine, Plus, Star, Trash2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AvailabilitySchedule, ContactChannel, Property, User, Weekday } from "@/features/admin/types";
import { ROLE_OPTIONS, isPropertyManagerRole, isPropertyOwnerRole } from "@/features/admin/utils";
import { cn } from "@/lib/utils";

const makeId = () => Math.random().toString(36).slice(2);

const channelOptions = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

const weekdayOptions: { value: Weekday; label: string }[] = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

const ALL_DAYS = weekdayOptions.map((day) => day.value);
const hourOptions = Array.from({ length: 24 }, (_, index) => index.toString().padStart(2, "0"));
const minuteOptions = ["00", "15", "30", "45"];

const getInitials = (name?: string) =>
  name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LG";

const defaultAvailability = (): AvailabilitySchedule => ({
  always: true,
  days: [...ALL_DAYS],
  start: "00:00",
  end: "23:59",
});

const ensureAvailability = (availability?: AvailabilitySchedule): AvailabilitySchedule => ({
  always: availability?.always ?? true,
  days: availability?.days?.length ? availability.days : [...ALL_DAYS],
  start: availability?.start ?? "09:00",
  end: availability?.end ?? "18:00",
});

type ChannelState = ContactChannel & { localId: string };

type FormState = {
  id?: string;
  name: string;
  role: string;
  availability: AvailabilitySchedule;
  photo?: string;
  accessLevel: User["accessLevel"];
  channels: ChannelState[];
  managedPropertyIds: string[];
};

export type UserFormState = FormState;

const getLabelForType = (type: string) => {
  switch (type) {
    case "email":
      return "Email";
    case "sms":
      return "SMS";
    case "whatsapp":
      return "WhatsApp";
    default:
      return "Phone";
  }
};

const createChannel = (overrides: Partial<ContactChannel> = {}): ChannelState => {
  const type = overrides.type ?? "phone";
  return {
    localId: `channel-${makeId()}`,
    type,
    label: getLabelForType(type),
    value: "",
    action: "",
    primary: false,
    ...overrides,
  };
};

export const createUserDraft = (user?: User): UserFormState => ({
  id: user?.id ?? undefined,
  name: user?.name ?? "",
  role: user?.role ?? "",
  availability: ensureAvailability(user?.availability),
  photo: user?.photo ?? "",
  accessLevel: user?.accessLevel ?? "viewer",
  channels: (user?.channels?.length ? user.channels : [createChannel()]).map((channel) =>
    createChannel(channel),
  ),
  managedPropertyIds: user?.managedPropertyIds ?? [],
});

type UserEditorFormProps = {
  value: UserFormState;
  onChange: (next: UserFormState) => void;
  properties: Property[];
  activeSection: "user-details" | "contacts" | "managed-properties";
  readOnly?: boolean;
  canEditAccessLevel?: boolean;
  canEditName?: boolean;
  canEditContacts?: boolean;
  canEditAvatar?: boolean;
};

const buildAction = (type: string, raw: string) => {
  const value = raw?.trim() || "";
  if (!value) return "";
  switch (type) {
    case "email":
      return `mailto:${value}`;
    case "phone":
      return `tel:${value.replace(/[^+\d]/g, "")}`;
    case "sms":
      return `sms:${value.replace(/[^+\d]/g, "")}`;
    default:
      return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
  }
};

const UserEditorForm = ({
  value,
  onChange,
  properties,
  activeSection,
  readOnly = false,
  canEditAccessLevel = false,
  canEditName = true,
  canEditContacts = true,
  canEditAvatar = true,
}: UserEditorFormProps) => {
  const canManageProperties = useMemo(
    () => (isPropertyManagerRole(value.role) || isPropertyOwnerRole(value.role)) && !readOnly,
    [value.role, readOnly],
  );
  const roleOptions = useMemo(() => {
    const base = [...ROLE_OPTIONS];
    if (value.role && !base.includes(value.role)) {
      base.push(value.role);
    }
    return base;
  }, [value.role]);
  const selectedProperties = useMemo(
    () =>
      (value.managedPropertyIds ?? [])
        .map((propertyId) => properties.find((property) => property.id === propertyId)?.name)
        .filter(Boolean) as string[],
    [value.managedPropertyIds, properties],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const avatarEditable = !readOnly || canEditAvatar;

  const update = (patch: Partial<UserFormState>, options?: { bypassReadOnly?: boolean }) => {
    if (readOnly && !options?.bypassReadOnly) return;
    onChange({ ...value, ...patch });
  };

  const updateAvailability = (patch: Partial<AvailabilitySchedule>) =>
    update({ availability: { ...value.availability, ...patch } });

  const updateChannel = (channelId: string, patch: Partial<ChannelState>) => {
    if (readOnly && !canEditContacts) return;
    const channels = value.channels.map((channel) => {
      if (channel.localId !== channelId) {
        if (patch.primary) {
          return { ...channel, primary: false };
        }
        return channel;
      }
      const next = { ...channel, ...patch };
      if (patch.type) {
        next.label = getLabelForType(patch.type);
      }
      if (patch.value !== undefined || patch.type) {
        next.action = buildAction(patch.type ?? channel.type, patch.value ?? channel.value);
      }
      if (patch.primary) {
        next.primary = true;
      }
      return next;
    });
    update({ channels }, { bypassReadOnly: readOnly && canEditContacts });
  };

  const handlePropertyToggle = (propertyId: string, checked: boolean) => {
    if (!canManageProperties) return;
    const managedPropertyIds = checked
      ? Array.from(new Set([...(value.managedPropertyIds ?? []), propertyId]))
      : (value.managedPropertyIds ?? []).filter((id) => id !== propertyId);
    update({ managedPropertyIds });
  };

  const openAvatarDialog = () => {
    if (!avatarEditable) return;
    setPendingAvatar(value.photo || null);
    setAvatarDialogOpen(true);
  };

  const handleFileSelection = (file?: File) => {
    if (!avatarEditable || !file) return;
    const preview = URL.createObjectURL(file);
    setPendingAvatar(preview);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!avatarEditable) return;
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleAvatarSave = () => {
    if (!pendingAvatar || !avatarEditable) return;
    update({ photo: pendingAvatar }, { bypassReadOnly: readOnly && avatarEditable });
    setAvatarDialogOpen(false);
  };

  const toggleDay = (day: Weekday) => {
    if (readOnly) return;
    const days = value.availability.days.includes(day)
      ? value.availability.days.filter((item) => item !== day)
      : [...value.availability.days, day].sort((a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b));
    updateAvailability({ days });
  };

  if (activeSection === "contacts") {
    return (
      <fieldset disabled={readOnly && !canEditContacts} className="contents">
        <div className="space-y-3 rounded-2xl border border-border/70 bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold text-ink-strong">Contacts</Label>
              <p className="text-xs text-ink-muted">Add the ways teammates can reach this user.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() =>
                canEditContacts &&
                update({ channels: [...value.channels, createChannel()] }, { bypassReadOnly: readOnly && canEditContacts })
              }
              disabled={readOnly && !canEditContacts}
            >
              <Plus className="h-4 w-4" /> Add contact
            </Button>
          </div>
          <div className="space-y-3">
            {value.channels.map((channel, index) => (
              <div key={channel.localId} className="rounded-2xl border border-border/70 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex-1 space-y-2">
                  <Label>Type</Label>
                  <Select value={channel.type} onValueChange={(type) => updateChannel(channel.localId, { type })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {channelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label>
                    {channel.type === "email" ? "Contact address" : "Contact number"}
                  </Label>
                  <Input
                    value={channel.value}
                    onChange={(event) => updateChannel(channel.localId, { value: event.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-xs text-ink-muted">{channel.action || "Action link generated automatically"}</div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={channel.primary ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => updateChannel(channel.localId, { primary: true })}
                  >
                    <Star className="h-4 w-4" />
                    Primary
                  </Button>
                  {value.channels.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="text-ink-muted">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            canEditContacts &&
                            update(
                              { channels: value.channels.filter((item) => item.localId !== channel.localId) },
                              { bypassReadOnly: readOnly && canEditContacts },
                            )
                          }
                        >
                          Delete contact
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
            ))}
          </div>
        </div>
      </fieldset>
    );
  }

  if (activeSection === "managed-properties") {
    return (
      <fieldset disabled={readOnly} className="contents">
        <section className="space-y-4 rounded-2xl border border-border bg-card/50 p-4">
          <div>
            <p className="text-sm font-semibold text-ink-strong">Managed properties</p>
            <p className="text-xs text-ink-muted">
              {canManageProperties
                ? "Select which properties this teammate is responsible for."
                : "Assigning properties is only available for Owner or Property Manager roles."}
            </p>
          </div>
          <div className="divide-y divide-border rounded-2xl border border-border/60">
            {properties.map((property) => {
              const checked = value.managedPropertyIds?.includes(property.id);
              return (
                <label
                  key={property.id}
                  className={cn(
                    "flex items-center justify-between gap-4 px-4 py-3 text-sm",
                    !canManageProperties && "text-ink-muted",
                  )}
                >
                  <span>{property.name}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-sidebar-primary focus:ring-sidebar-primary"
                    checked={checked}
                    onChange={(event) => handlePropertyToggle(property.id, event.target.checked)}
                    disabled={!canManageProperties}
                  />
                </label>
              );
            })}
          </div>
          {canManageProperties ? (
            selectedProperties.length ? (
              <div className="text-xs text-ink-muted">{selectedProperties.length} property assigned.</div>
            ) : (
              <Badge variant="outline">No properties assigned</Badge>
            )
          ) : (
            <Badge variant="outline">Update role to assign properties.</Badge>
          )}
        </section>
      </fieldset>
    );
  }

  return (
    <>
      <section className="space-y-6 rounded-2xl border border-border bg-card/80 p-4 shadow-sm md:p-6">
        <div className="grid gap-6 md:grid-cols-[220px,1fr]">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="h-28 w-28">
                {value.photo ? <AvatarImage src={value.photo} alt={value.name} className="object-cover" /> : null}
              <AvatarFallback className="bg-muted text-2xl font-semibold text-ink-strong">
                {getInitials(value.name)}
              </AvatarFallback>
            </Avatar>
            {avatarEditable && (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute bottom-1 right-1 h-9 w-9 rounded-full shadow"
                onClick={openAvatarDialog}
              >
                <PencilLine className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-ink-muted text-center">Profile photo</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={value.name}
              onChange={(event) =>
                update({ name: event.target.value }, { bypassReadOnly: readOnly && canEditName })
              }
              disabled={readOnly && !canEditName}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={value.role || undefined} onValueChange={(role) => update({ role })} disabled={readOnly}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Access level</Label>
            <fieldset disabled={readOnly || !canEditAccessLevel} className="contents">
              <Select
                value={value.accessLevel}
                onValueChange={(accessLevel: User["accessLevel"]) => {
                  if (readOnly || !canEditAccessLevel) return;
                  update({ accessLevel });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </fieldset>
          </div>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-dashed border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-strong">Availability</p>
            <p className="text-xs text-ink-muted">Set the hours this teammate is reachable.</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-strong">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-sidebar-primary focus:ring-sidebar-primary"
              checked={value.availability.always}
              onChange={(event) => updateAvailability({ always: event.target.checked })}
              disabled={readOnly}
            />
            Available at all times
          </label>
        </div>

        {!value.availability.always && (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <TimePickerField
                label="Start time"
                value={value.availability.start}
                onChange={(start) => updateAvailability({ start })}
                disabled={readOnly}
              />
              <TimePickerField
                label="End time"
                value={value.availability.end}
                onChange={(end) => updateAvailability({ end })}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label>Available days</Label>
              <div className="flex flex-wrap gap-2">
                {weekdayOptions.map((day) => {
                  const selected = value.availability.days.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm transition",
                        selected
                          ? "border-sidebar-primary bg-sky-200 text-sidebar-primary"
                          : "border-border bg-background text-ink-muted",
                      )}
                      disabled={readOnly}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
        </div>
      </section>
      <Dialog
        open={avatarDialogOpen}
        onOpenChange={(open) => {
          setAvatarDialogOpen(open);
          if (!open) {
            setPendingAvatar(null);
            setDragging(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update avatar</DialogTitle>
            <DialogDescription>Upload an image or drag and drop a file to preview.</DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              "relative flex h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed text-center",
              dragging ? "border-sidebar-primary bg-sidebar-primary/10" : "border-border bg-muted/20",
              !avatarEditable && "pointer-events-none opacity-70",
            )}
            onDragOver={(event) => {
              if (!avatarEditable) return;
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => avatarEditable && setDragging(false)}
            onDrop={handleDrop}
          >
            {pendingAvatar ? (
              <>
                <img src={pendingAvatar} alt="Avatar preview" className="h-full w-full rounded-2xl object-cover" />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full text-destructive"
                  onClick={() => avatarEditable && setPendingAvatar(null)}
                  disabled={!avatarEditable}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <p className="max-w-xs text-sm text-ink-muted">
                Drop an image here or click “Choose file” to upload.
              </p>
            )}
          </div>
          <div className="flex w-full items-center justify-between gap-3">
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
                disabled={!avatarEditable}
              >
                <Upload className="h-4 w-4" /> Choose file
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFileSelection(event.target.files?.[0])}
                disabled={!avatarEditable}
              />
            </div>
            <Button type="button" disabled={!pendingAvatar || !avatarEditable} onClick={handleAvatarSave}>
              Save avatar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserEditorForm;

type TimePickerFieldProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

const TimePickerField = ({ label, value, onChange, disabled = false }: TimePickerFieldProps) => {
  const [open, setOpen] = useState(false);
  const [hour = "00", minute = "00"] = value.split(":");

  const selectHour = (nextHour: string) => {
    if (disabled) return;
    onChange(`${nextHour}:${minute || "00"}`);
  };

  const selectMinute = (nextMinute: string) => {
    if (disabled) return;
    onChange(`${hour || "00"}:${nextMinute}`);
    setOpen(false);
  };

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <DropdownMenu open={disabled ? false : open} onOpenChange={(next) => !disabled && setOpen(next)}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className="flex w-full items-center justify-between font-mono"
            disabled={disabled}
          >
            <span>{`${hour}:${minute}`}</span>
            <Clock className="h-4 w-4 text-ink-muted" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-58 p-3" align="start">
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="mb-2 text-xs font-semibold text-ink-muted">Hours</p>
              <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                {hourOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectHour(option)}
                    className={cn(
                      "w-full rounded-md px-2 py-1 text-left text-sm font-mono",
                      option === hour ? "bg-sidebar-primary text-white" : "text-ink-muted hover:bg-muted"
                    )}
                    disabled={disabled}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <p className="mb-2 text-xs font-semibold text-ink-muted">Minutes</p>
              <div className="space-y-1">
                {minuteOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectMinute(option)}
                    className={cn(
                      "w-full rounded-md px-2 py-1 text-left text-sm font-mono",
                      option === minute ? "bg-sidebar-primary text-white" : "text-ink-muted hover:bg-muted"
                    )}
                    disabled={disabled}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
