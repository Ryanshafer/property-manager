import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Property } from "@/features/admin/types";
import { formatUpdatedAt } from "@/features/admin/utils";

export type PropertyTableProps = {
  properties: Property[];
  onOpen: (property: Property) => void;
  onDelete: (property: Property) => void;
};

const PropertyTable = ({ properties, onOpen, onDelete }: PropertyTableProps) => (
  <div className="overflow-hidden rounded-2xl border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <TableRow key={property.id} className="hover:bg-muted/40">
            <TableCell className="font-semibold">{property.name}</TableCell>
            <TableCell>{property.location || "—"}</TableCell>
            <TableCell>{formatUpdatedAt(property.updatedAt)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => onOpen(property)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(property)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default PropertyTable;
