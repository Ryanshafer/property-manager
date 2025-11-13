import { CalendarClock, GitFork, MoreVertical } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Property } from "@/features/admin/types";
import { formatUpdatedAt } from "@/features/admin/utils";

export type PropertyCardProps = {
  property: Property;
  onOpen: () => void;
  onClone: () => void;
  canClone?: boolean;
  isViewer?: boolean;
};

const PropertyCard = ({ property, onOpen, onClone, canClone = true, isViewer = false }: PropertyCardProps) => {
  const cover = useMemo(
    () => property.welcome.heroImage || "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    [property.welcome.heroImage],
  );

  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 w-full bg-cover bg-center" style={{ backgroundImage: `url(${cover})` }} aria-hidden>
        {canClone && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 border border-white/40 bg-black/50 text-white backdrop-blur"
                aria-label="More property actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2 text-sm font-semibold text-ink-strong" onClick={onClone}>
                <GitFork className="h-4 w-4" />
                Clone this property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            {property.location && (
              <div className="mb-1 flex items-center gap-1 text-label-sm text-ink-muted">
                <Badge variant="outline">{property.location}</Badge>
              </div>
            )}
            <CardTitle className="text-title-md leading-title-md text-ink-strong">{property.name}</CardTitle>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <CalendarClock className="h-4 w-4" />
          <span>Updated {formatUpdatedAt(property.updatedAt)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="default"
            size="lg"
            className="w-full justify-center gap-2 text-base font-semibold"
            onClick={onOpen}
          >
            {isViewer ? "View property" : "Edit property"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
