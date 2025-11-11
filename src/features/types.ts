export type DiscoverCategory = "restaurant" | "beach" | "nightlife" | "activity";

export interface DiscoverLocation {
  id: string;
  category: DiscoverCategory;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
}

export interface DiscoverLocationDetail {
  rating: number;
  reviewCount: number;
  priceRange: string;
  cuisine: string;
  distance: string;
  photo: string;
  hours?: {
    open: string;
    close: string;
  };
}

export type AssistanceChannelType = "whatsapp" | "phone" | "email";

export interface AssistanceChannel {
  type: AssistanceChannelType;
  label: string;
  value: string;
  action: string;
  primary?: boolean;
}

export interface AssistanceContact {
  id: string;
  name: string;
  role: string;
  availability: string;
  photo: string;
  channels: AssistanceChannel[];
}

export interface AssistanceConfig {
  emergency?: AssistanceChannel;
  contacts: AssistanceContact[];
  supportTips: string[];
}

export interface PropertyCareItem {
  title: string;
  description: string;
}

export interface PropertyCareCategory {
  id: string;
  label: string;
  icon: string;
  accent: {
    iconBg: string;
    iconColor: string;
  };
  items: PropertyCareItem[];
}
