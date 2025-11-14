import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { DiscoverCard, DiscoverCategory } from "@/features/admin/types";
import { ExternalLink, Loader2, MapPin, MoreVertical, Plus, Search, X } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

type GeocoderStatus =
  | "OK"
  | "ZERO_RESULTS"
  | "ERROR"
  | "INVALID_REQUEST"
  | "OVER_QUERY_LIMIT"
  | "REQUEST_DENIED"
  | "UNKNOWN_ERROR";

type PlacesServiceStatus =
  | "OK"
  | "ZERO_RESULTS"
  | "INVALID_REQUEST"
  | "OVER_QUERY_LIMIT"
  | "REQUEST_DENIED"
  | "UNKNOWN_ERROR";

export type DiscoverFormProps = {
  value: DiscoverCard[];
  onChange: (cards: DiscoverCard[]) => void;
  coordinates?: { lat: number; lng: number };
  location?: string;
  readOnly?: boolean;
};

const CATEGORY_OPTIONS: DiscoverCategory[] = ["restaurant", "beach", "nightlife", "activity"];
const CATEGORY_LABELS: Record<DiscoverCategory, string> = {
  restaurant: "Restaurant",
  beach: "Beach",
  nightlife: "Nightlife",
  activity: "Activity",
};
const FALLBACK_COORDINATES = { lat: 41.9028, lng: 12.4964 };
const SEARCH_RADIUS_OPTIONS = [50, 100, 150, 200, 300] as const;
const DEFAULT_SEARCH_RADIUS_KM = 200;
const MIN_QUERY_LENGTH = 4;
const SEARCH_DEBOUNCE_MS = 400;

const DiscoverForm = ({ value, onChange, coordinates, location, readOnly = false }: DiscoverFormProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GooglePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeMeta, setPlaceMeta] = useState<Record<string, PlaceSummary>>({});
  const [mapsApi, setMapsApi] = useState<typeof window.google | null>(null);
  const [photoViewer, setPhotoViewer] = useState<{ placeId: string; urls: string[]; index: number; title?: string } | null>(null);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(DEFAULT_SEARCH_RADIUS_KM);
  const isReadOnly = Boolean(readOnly);

  const apiKey = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY;
  const [searchCenter, setSearchCenter] = useState(coordinates || FALLBACK_COORDINATES);

  const handleRadiusChange = (value: string) => {
    if (isReadOnly) return;
    setSearchRadiusKm(Number(value));
  };

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then((googleInstance) => {
        if (!cancelled) setMapsApi(googleInstance);
      })
      .catch((loadError) => {
        console.error(loadError);
        if (!cancelled) setError("Google Maps failed to load. Check API key and enabled libraries.");
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  const autocompleteService = useMemo(() => {
    if (!mapsApi) return null;
    return new mapsApi.maps.places.AutocompleteService();
  }, [mapsApi]);

  const placesService = useMemo(() => {
    if (!mapsApi) return null;
    return new mapsApi.maps.places.PlacesService(document.createElement("div"));
  }, [mapsApi]);

  useEffect(() => {
    if (coordinates) {
      setSearchCenter(coordinates);
      return;
    }
    if (!mapsApi || !location) {
      setSearchCenter(FALLBACK_COORDINATES);
      return;
    }

    let cancelled = false;
    const geocoder = new mapsApi.maps.Geocoder();
    const geocodeCallback: GeocodeCallback = (results, status) => {
      if (cancelled) return;
      if (status === "OK" && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        setSearchCenter({ lat: loc.lat(), lng: loc.lng() });
      } else {
        setSearchCenter(FALLBACK_COORDINATES);
      }
    };

    geocoder.geocode({ address: location }, geocodeCallback);

    return () => {
      cancelled = true;
    };
  }, [coordinates, mapsApi, location]);

  useEffect(() => {
    if (!placesService || !mapsApi) return;
    const missing = value
      .map((entry) => entry.placeId)
      .filter((placeId) => {
        const summary = placeMeta[placeId];
        return !summary || (!summary.photoThumb && !(summary.photos?.length));
      });
    if (!missing.length) return;

    let cancelled = false;
    const handlePlaceSummary = (placeId: string): PlaceDetailsCallback => (result, status) => {
      if (cancelled) return;
      if (status !== "OK" || !result) return;
      const photoUrls =
        result.photos?.map((photo) => photo.getUrl({ maxWidth: 640, maxHeight: 640 })).filter(Boolean) ?? [];
      setPlaceMeta((prev) => ({
        ...prev,
        [placeId]: {
          name: result.name,
          address: result.formatted_address,
          rating: result.rating,
          userRatingsTotal: result.user_ratings_total,
          photoThumb: photoUrls[0],
          photos: photoUrls,
        },
      }));
    };

    missing.forEach((placeId) => {
      placesService.getDetails(
        { placeId, fields: ["name", "formatted_address", "photos", "rating", "user_ratings_total"] },
        handlePlaceSummary(placeId),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [mapsApi, placesService, placeMeta, value]);

  const performSearch = (input: string) => {
    if (isReadOnly) return;
    const trimmed = input.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      return;
    }
    if (!apiKey) {
      setError("Add PUBLIC_GOOGLE_MAPS_API_KEY to enable search.");
      return;
    }
    if (!autocompleteService || !mapsApi) {
      setError("Google Places not ready yet. Please wait a moment and try again.");
      return;
    }

    setLoading(true);
    setError(null);

    const locationBias = new mapsApi.maps.Circle({
      center: searchCenter,
      radius: searchRadiusKm * 1000,
    });

    const handlePredictions: PredictionsCallback = (predictions, status) => {
      setLoading(false);
      if (!mapsApi) return;
      if (status !== "OK" && status !== "ZERO_RESULTS") {
        setError("Google Places could not complete the search. Try another keyword.");
        setResults([]);
        return;
      }
      const baseResults = (predictions || []).map((prediction) => ({
        place_id: prediction.place_id,
        description: prediction.description,
        primary_text: prediction.structured_formatting?.main_text || prediction.description,
        photos: [],
      }));
      setResults(baseResults);

      if (!placesService) return;
      const handlePhotos = (placeId: string): PlaceDetailsCallback => (detail, detailStatus) => {
        if (!mapsApi) return;
        if (detailStatus !== "OK" || !detail) return;
        const loc = detail.geometry?.location;
        if (loc) {
          const distanceKm = distanceInKm(searchCenter, { lat: loc.lat(), lng: loc.lng() });
          if (distanceKm > searchRadiusKm) {
            setResults((prev) => prev.filter((item) => item.place_id !== placeId));
            return;
          }
        }
        const photoUrls = detail.photos?.map((photo) => photo.getUrl({ maxWidth: 640, maxHeight: 640 })).filter(Boolean) ?? [];
        const thumb = detail.photos?.[0]?.getUrl({ maxWidth: 120, maxHeight: 120 });
        setResults((prev) =>
          prev.map((item) =>
            item.place_id === placeId ? { ...item, photoUrl: thumb || item.photoUrl, photos: photoUrls } : item,
          ),
        );
      };

      baseResults.forEach((result) => {
        placesService.getDetails(
          { placeId: result.place_id, fields: ["photos", "geometry"] },
          handlePhotos(result.place_id),
        );
      });
    };

    autocompleteService.getPlacePredictions(
      {
        input: trimmed,
        locationBias,
        strictBounds: true,
      },
      handlePredictions,
    );
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (isReadOnly) return;
    performSearch(query);
  };

  useEffect(() => {
    if (isReadOnly) return;
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      return;
    }
    const timer = window.setTimeout(() => performSearch(trimmed), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query, searchCenter, autocompleteService, mapsApi, isReadOnly]);

  const handleAddPlace = (place: GooglePrediction) => {
    if (isReadOnly || value.some((entry) => entry.placeId === place.place_id)) return;
    const entry: DiscoverCard = {
      id: `discover-${Date.now().toString(36)}`,
      placeId: place.place_id,
      category: CATEGORY_OPTIONS[0],
      note: "",
    };
    onChange([entry, ...value]);
    setPlaceMeta((prev) => ({
      ...prev,
      [place.place_id]: {
        name: place.primary_text,
        address: place.description,
        rating: undefined,
        userRatingsTotal: undefined,
        photoThumb: place.photoUrl,
        photos: place.photos,
      },
    }));
    setResults([]);
    setQuery("");
  };

  const handleEntryChange = (id: string, patch: Partial<DiscoverCard>) => {
    if (isReadOnly) return;
    const next = value.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
    onChange(next);
  };

  const handleRemove = (id: string) => {
    if (isReadOnly) return;
    onChange(value.filter((entry) => entry.id !== id));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-muted p-4">
        <form className="flex flex-col gap-3 md:flex-row" onSubmit={(event) => event.preventDefault()}>
          <div className="flex-1">
            <label className="text-sm font-medium text-ink-strong">Add a new location</label>
            <div className="mt-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search nearby spots"
                  className="pl-9 pr-9 bg-white"
                  disabled={isReadOnly}
                />
                <div className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />
                  ) : (
                    query && (
                      <button
                        type="button"
                        className="flex h-full w-full items-center justify-center rounded-full text-ink-muted transition hover:text-ink-strong"
                        onClick={() => {
                          setQuery("");
                          setResults([]);
                          setError(null);
                        }}
                        aria-label="Clear search"
                        disabled={isReadOnly}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <p>
                Limit results to {location || "the property location"} within:
              </p>
              <Select value={String(searchRadiusKm)} onValueChange={handleRadiusChange}>
                <SelectTrigger className="h-7 w-24 text-xs bg-white" disabled={isReadOnly}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {SEARCH_RADIUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option} km
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!apiKey && <p className="mt-1 text-xs text-destructive">Set PUBLIC_GOOGLE_MAPS_API_KEY in your environment to enable search.</p>}
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
        </form>
        {results.length > 0 && (
          <div className="mt-4 space-y-3">
            {results.map((place) => (
              <div key={place.place_id} className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-3 py-2">
                <div className="flex items-center gap-3">
                  {place.photoUrl ? (
                    <button
                      type="button"
                      className="h-14 w-14 flex-none overflow-hidden rounded-xl"
                      onClick={() =>
                        place.photos?.length &&
                        setPhotoViewer({
                          placeId: place.place_id,
                          urls: place.photos,
                          index: 0,
                          title: place.primary_text,
                        })
                      }
                    >
                      <img src={place.photoUrl} alt="Preview" className="h-full w-full object-cover" />
                    </button>
                  ) : (
                    <div className="h-14 w-14 flex-none rounded-xl bg-muted" />
                  )}
                  <div>
                    <p className="font-semibold text-ink-strong">{place.primary_text}</p>
                    <p className="text-xs text-ink-muted">{place.description}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleAddPlace(place)} disabled={isReadOnly}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        {value.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-ink-muted">
            No discover spots yet—search for a place and add it.
          </div>
        )}
        {value.map((entry) => {
          const meta = placeMeta[entry.placeId];
          const searchResult = results.find((result) => result.place_id === entry.placeId);
          const entryPhotos = meta?.photos?.length ? meta.photos : searchResult?.photos || [];
          const photoThumb = meta?.photoThumb ?? searchResult?.photoUrl;
          return (
            <div key={entry.id} className="space-y-4 rounded-2xl border border-border bg-card/80 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="h-16 w-16 flex-none overflow-hidden rounded-xl border border-border/70 bg-muted"
                    onClick={() =>
                      entryPhotos.length &&
                      setPhotoViewer({
                        placeId: entry.placeId,
                        urls: entryPhotos,
                        index: 0,
                        title: meta?.name,
                      })
                    }
                    disabled={!entryPhotos.length}
                  >
                    {photoThumb ? (
                      <img src={photoThumb} alt={meta?.name || "Preview"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-ink-muted">No photo</div>
                    )}
                  </button>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-ink-strong">{meta?.name || "Unknown place"}</p>
                      {meta?.rating && (
                        <span className="text-sm font-medium text-ink-muted">
                          ★ {meta.rating.toFixed(1)}
                          {meta.userRatingsTotal ? ` (${meta.userRatingsTotal})` : ""}
                        </span>
                      )}
                    </div>
                    {meta?.address ? (
                      <a
                        href={`https://www.google.com/maps/place/?q=place_id:${entry.placeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-sidebar-primary hover:underline"
                      >
                        <MapPin className="h-4 w-4" />
                        {meta.address}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <p className="text-sm text-ink-muted">Address unavailable</p>
                    )}
                  </div>
                </div>
                {!isReadOnly && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 border border-border">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive" onClick={() => handleRemove(entry.id)}>
                        Remove location
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink-strong">Category</label>
                  <Select
                    value={entry.category}
                    onValueChange={(category: DiscoverCategory) => {
                      if (isReadOnly) return;
                      handleEntryChange(entry.id, { category });
                    }}
                  >
                    <SelectTrigger disabled={isReadOnly}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((category) => (
                        <SelectItem key={category} value={category}>
                          {CATEGORY_LABELS[category]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink-strong">Note (optional)</label>
                  <Textarea
                    value={entry.note || ""}
                    onChange={(event) => handleEntryChange(entry.id, { note: event.target.value })}
                    rows={3}
                    placeholder="Add a helpful detail for the guest team"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>
      <PhotoViewerDialog viewer={photoViewer} onClose={() => setPhotoViewer(null)} />
    </div>
  );
};

export default DiscoverForm;

const loadGoogleMaps = (apiKey: string): Promise<typeof window.google> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in the browser"));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  const existingScript = document.querySelector<HTMLScriptElement>("script[data-google-maps]");
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => {
        if (window.google?.maps?.places) {
          resolve(window.google);
        } else {
          reject(new Error("Google Maps failed to initialize"));
        }
      });
      existingScript.addEventListener("error", () => reject(new Error("Google Maps script errored")));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "true";
    script.onload = () => {
      if (window.google?.maps?.places) {
        resolve(window.google);
      } else {
        reject(new Error("Google Maps failed to initialize"));
      }
    };
    script.onerror = () => reject(new Error("Google Maps script failed to load"));
    document.head.appendChild(script);
  });
};

interface GooglePrediction {
  place_id: string;
  description: string;
  primary_text: string;
  photoUrl?: string;
  photos?: string[];
}

type GoogleAutocompletePrediction = {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
  };
};

type GeocoderResult = {
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
};

type PlacePhoto = {
  getUrl: (options: { maxWidth: number; maxHeight: number }) => string;
};

type PlaceDetailsResult = {
  name?: string;
  formatted_address?: string;
  photos?: PlacePhoto[];
  rating?: number;
  user_ratings_total?: number;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
};

type GeocodeCallback = (results: GeocoderResult[] | null, status: GeocoderStatus) => void;
type PlaceDetailsCallback = (result: PlaceDetailsResult | null, status: PlacesServiceStatus) => void;
type PredictionsCallback = (predictions: GoogleAutocompletePrediction[] | null, status: PlacesServiceStatus) => void;

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceInKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    sinLng * sinLng * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return earthRadiusKm * c;
};

interface PlaceSummary {
  name?: string;
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  photoThumb?: string;
  photos?: string[];
}

type PhotoViewerProps = {
  viewer: { placeId: string; urls: string[]; index: number; title?: string } | null;
  onClose: () => void;
};

const PhotoViewerDialog = ({ viewer, onClose }: PhotoViewerProps) => {
  const [index, setIndex] = useState(viewer?.index ?? 0);

  useEffect(() => {
    if (!viewer) return;
    setIndex(viewer.index ?? 0);
  }, [viewer]);

  if (!viewer) return null;
  const hasImages = viewer.urls?.length;
  const current = hasImages ? viewer.urls[index] : null;

  return (
    <Dialog open={Boolean(viewer)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{viewer.title ? `Photos from ${viewer.title}` : "Place photos"}</DialogTitle>
        </DialogHeader>
        {current ? (
          <div className="flex flex-col items-center gap-4">
            <img src={current} alt="Place" className="max-h-[60vh] w-full rounded-2xl object-cover" />
            {hasImages && viewer.urls.length > 1 && (
              <div className="flex gap-2">
                {viewer.urls.map((url, idx) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setIndex(idx)}
                    className={cn(
                      "h-16 w-16 overflow-hidden rounded-xl border",
                      idx === index ? "border-sidebar-primary" : "border-border",
                    )}
                  >
                    <img src={url} alt="Thumb" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-ink-muted">No photos available for this place.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
