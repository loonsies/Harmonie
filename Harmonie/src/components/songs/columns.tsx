"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Song } from "@/data/types/song";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Song>[] = [
  {
    id: "select",
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "comment",
    header: "Comment",
  },
  {
    accessorKey: "author",
    header: "Author",
  },
  {
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string;
      const tagList = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      return (
        <div className="flex flex-wrap gap-1">
          {tagList.map((tag, index) => (
            <Badge key={index} className="capitalize">
              {tag}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "dateUploaded",
    header: "Uploaded",
    cell: ({ row }) => {
      const dateValue = row.getValue("dateUploaded");
      if (!dateValue) return null;

      const date = new Date(dateValue as string | number);
      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);

      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "origin",
    header: "Origin",
  },
];
