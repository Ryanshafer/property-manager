import propertiesData from "@/data/properties.json";
import usersData from "@/data/users.json";
import type { AccessLevel, AvailabilitySchedule, Property, User, Weekday } from "./types";

type RawProperty = Property & Record<string, unknown>;
type RawUser = Omit<User, "accessLevel" | "managedPropertyIds" | "availability"> & {
  accessLevel?: AccessLevel;
  managedPropertyIds?: string[];
  availability?: AvailabilitySchedule | string;
};

export const initialProperties: Property[] = (propertiesData as RawProperty[]).map((property) => ({
  ...property,
  updatedAt: property.updatedAt || new Date().toISOString(),
}));

export const deriveAccessLevel = (role: string): AccessLevel => {
  const normalized = role?.toLowerCase() ?? "";
  if (normalized.includes("owner")) return "admin";
  if (normalized.includes("manager")) return "editor";
  return "viewer";
};

export const isPropertyManagerRole = (role: string) => role?.toLowerCase().includes("manager");
export const isPropertyOwnerRole = (role: string) => role?.toLowerCase().includes("owner");
export const isOperationsCoordinatorRole = (role: string) => role?.toLowerCase().includes("operations coordinator");

const deriveRoleOptions = () => {
  const fromData = Array.from(
    new Set(
      (usersData as RawUser[])
        .map((user) => user.role)
        .filter((role): role is string => Boolean(role && role.trim())),
    ),
  );
  if (fromData.length) return fromData;
  return ["Property Owner", "Property Manager", "Operations Coordinator"];
};

export const ROLE_OPTIONS = deriveRoleOptions();

const WEEK_DAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const normalizeAvailability = (availability?: AvailabilitySchedule | string): AvailabilitySchedule => {
  if (availability && typeof availability === "object" && "always" in availability) {
    return {
      always: Boolean(availability.always),
      days: availability.days?.length ? availability.days : [...WEEK_DAYS],
      start: availability.start || "00:00",
      end: availability.end || "23:59",
    };
  }

  if (typeof availability === "string" && availability.toLowerCase().includes("always")) {
    return { always: true, days: [...WEEK_DAYS], start: "00:00", end: "23:59" };
  }

  return { always: true, days: [...WEEK_DAYS], start: "00:00", end: "23:59" };
};

export const initialUsers: User[] = (usersData as RawUser[]).map((user) => ({
  ...user,
  availability: normalizeAvailability(user.availability),
  accessLevel: user.accessLevel ?? deriveAccessLevel(user.role),
  managedPropertyIds: user.managedPropertyIds ?? [],
}));

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48) || "property";

export const createEmptyProperty = (
  options: { name: string; location?: string } = { name: "New Property" },
): Property => {
  const timestamp = new Date().toISOString();
  return {
    id: `${slugify(options.name)}-${Date.now().toString(36)}`,
    name: options.name.trim() || "Untitled property",
    location: options.location,
    coordinates: { lat: 41.9028, lng: 12.4964 },
    welcome: {
      heroImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      host: {
        name: "Host name",
        title: "Local host",
        avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39",
      },
      greeting: "Welcome!",
      body: ["Customize the welcome message for your operations team."],
      ctaLabel: "Open guide",
    },
    rules: [
      {
        id: `rule-${Date.now().toString(32)}`,
        title: "New guideline",
        details: "Describe the key instruction the team needs to remember.",
      },
    ],
    wifi: {
      networkName: "",
      password: "",
      shareNote: "",
      instructions: [],
    },
    discover: [],
    assistance: {
      contacts: [],
    },
    propertyCare: {
      guidelines: [
        {
          id: `guideline-${Date.now().toString(36)}`,
          label: "General",
          icon: "sparkles",
          accent: {
            iconBg: "bg-violet-100",
            iconColor: "text-violet-600",
          },
          title: "Thermostat",
          description:
            "Keep set to 22°C/72°F for comfort. Turn off when opening windows or leaving for extended periods.",
        },
      ],
    },
    updatedAt: timestamp,
  };
};

export const cloneProperty = (
  property: Property,
  overrides: { name?: string; location?: string } = {},
): Property => ({
  ...property,
  id: `${slugify(overrides.name || property.name)}-${Date.now().toString(36)}`,
  name: overrides.name || `${property.name} Copy`,
  location: overrides.location ?? property.location,
  updatedAt: new Date().toISOString(),
  discover: property.discover.map((card) => ({ ...card, id: `${card.id}-${Date.now().toString(32)}` })),
  rules: property.rules.map((rule) => ({ ...rule, id: `${rule.id}-${Date.now().toString(32)}` })),
  propertyCare: {
    guidelines: property.propertyCare.guidelines.map((guideline) => ({
      ...guideline,
      id: `${guideline.id}-${Date.now().toString(32)}`,
    })),
  },
  coordinates: property.coordinates,
});

export const formatUpdatedAt = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const getUserSlug = (user: Pick<User, "name" | "id">) => {
  const base = slugify(user.name || "");
  return base || user.id || "user";
};

export { WEEK_DAYS, normalizeAvailability };
