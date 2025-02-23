"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Song } from "@/data/types/song";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2 } from "lucide-react";
import { tags } from "@/data/tags";
import { Button } from "@/components/ui/button";
import { downloadSongs } from "@/utils/downloadSongs";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
const getTagLabel = (value: string) => {
  const tag = tags.find((t) => t.value === value);
  return tag ? tag.label : value;
};

export const columns: ColumnDef<Song>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="align-middle"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "download",
    cell: ({ row }) => (
      <Button
        onClick={() => {
          const song = row.original;
          downloadSongs([song]);
        }}
        variant="ghost"
        className="h-8 w-8 p-2 align-middle"
        aria-label="Download song"
      >
        <Download className="h-4 w-4" />
      </Button>
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
    cell: ({ row }) => {
      const origin = row.getValue("origin") as string;
      const author = row.original.authorName;
      const router = useRouter();

      if ((!origin && author) || origin === "harmonie") {
        return (
          <a
            onClick={() => router.push(`/user/${author}`)}
            className="text-purple-300 hover:underline cursor-pointer"
          >
            {author}
          </a>
        );
      }

      if (origin === "bmp") {
        return <div>{author}</div>;
      }

      return null;
    },
  },
  {
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags");
      const tagList = Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : [];

      return (
        <div className="flex gap-1">
          {tagList.map((tag) => (
            <Badge key={tag} variant="outline">
              {getTagLabel(tag)}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: "arrIncludesSome",
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
  {
    id: "actions",
    cell: ({ row }) => {
      const { toast } = useToast();

      const handleDelete = async () => {
        try {
          const response = await fetch("/api/songs/delete", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ songId: row.original.id }),
          });

          if (!response.ok) throw new Error("Failed to delete song");

          toast({
            title: "Success",
            description: "Song deleted successfully",
          });

          // Refresh the table
          window.location.reload();
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete song",
          });
        }
      };

      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      );
    },
  },
];
