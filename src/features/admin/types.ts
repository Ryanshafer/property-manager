export type Rule = {
  id: string;
  title: string;
  details: string;
  icon?: string;
};

export type Welcome = {
  heroImage: string;
  host: {
    name: string;
    title?: string;
    avatar?: string;
  };
  greeting: string;
  body: string[];
  ctaLabel?: string;
};

export type Wifi = {
  networkName: string;
  password: string;
  shareNote?: string;
  instructions: string[];
};

export type DiscoverCategory = "restaurant" | "beach" | "nightlife" | "activity";

export type DiscoverCard = {
  id: string;
  placeId: string;
  category: DiscoverCategory;
  note?: string;
};

export type Assistance = {
  contacts: Array<{
    role: string;
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
  }>;
};

export type ContactChannel = {
  type: string;
  label: string;
  value: string;
  action?: string;
  primary?: boolean;
};

export type AccessLevel = "admin" | "editor" | "viewer";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type AvailabilitySchedule = {
  always: boolean;
  days: Weekday[];
  start: string; // HH:mm
  end: string; // HH:mm
};

export type User = {
  id: string;
  name: string;
  role: string;
  availability: AvailabilitySchedule;
  photo?: string;
  channels: ContactChannel[];
  accessLevel: AccessLevel;
  managedPropertyIds: string[];
};

export type PropertyCare = {
  guidelines: Array<{
    id: string;
    label: string;
    icon?: string;
    accent?: {
      iconBg?: string;
      iconColor?: string;
    };
    title: string;
    description: string;
  }>;
};

export type Property = {
  id: string;
  name: string;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  welcome: Welcome;
  rules: Rule[];
  wifi: Wifi;
  discover: DiscoverCard[];
  assistance: Assistance;
  propertyCare: PropertyCare;
  updatedAt: string;
};

export type SessionUser = {
  id: string;
  name: string;
  role: string;
  accessLevel: AccessLevel;
  email?: string;
};

export type AdminState = {
  authed: boolean;
  user: SessionUser | null;
  properties: Property[];
  selectedPropertyId?: string;
  users: User[];
};

export type AdminAction =
  | { type: "LOGIN"; payload: SessionUser }
  | { type: "LOGOUT" }
  | { type: "ADD_PROPERTY"; payload: Property }
  | { type: "CLONE_PROPERTY"; payload: { sourceId: string; cloned: Property } }
  | { type: "DELETE_PROPERTY"; payload: { id: string } }
  | { type: "SELECT_PROPERTY"; payload: { id?: string } }
  | { type: "UPDATE_PROPERTY"; payload: { id: string; property: Property } }
  | { type: "UPDATE_PROPERTY_NODE"; payload: { id: string; node: keyof Property; value: unknown } }
  | { type: "IMPORT_PROPERTY_JSON"; payload: Property }
  | { type: "EXPORT_PROPERTY_JSON"; payload: { id: string } }
  | { type: "ADD_USER"; payload: { user: User } }
  | { type: "UPDATE_USER"; payload: { user: User } }
  | { type: "DELETE_USER"; payload: { id: string } };
