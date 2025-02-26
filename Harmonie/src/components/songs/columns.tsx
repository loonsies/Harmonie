"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Song } from "@/data/types/song";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, Star, Play } from "lucide-react";
import { tags } from "@/data/tags";
import { Button } from "@/components/ui/button";
import { downloadSongs } from "@/utils/downloadSongs";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { MidiPlayer } from "@/components/songs/MidiPlayer";

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
        className="align-middle"
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
    id: "actions",
    cell: ({ row }) => {
      const [isPlayerOpen, setIsPlayerOpen] = useState(false);
      const song = row.original;

      return (
        <>
          <div className="flex gap-1">
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
            <Button
              onClick={() => setIsPlayerOpen(true)}
              variant="ghost"
              className="h-8 w-8 p-2 align-middle"
              aria-label="Play song"
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{song.title}</DialogTitle>
              </DialogHeader>
              <MidiPlayer
                songId={song.id}
                download={song.download}
                origin={song.origin}
              />
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
  {
    accessorKey: "title",
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
    id: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [currentRating, setCurrentRating] = useState(0);
      const { data: session } = useSession();
      const songTitle = row.getValue("title") as string;
      const songId = row.original.id;
      const [averageRating, setAverageRating] = useState("0.0");

      const handleRatingSubmit = async (newRating: number) => {
        try {
          const response = await fetch("/api/ratings/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              songId,
              rating: newRating,
            }),
          });

          if (!response.ok) throw new Error("Failed to submit rating");

          setIsDialogOpen(false);
          // Fetch the updated average rating
          const avgResponse = await fetch(
            `/api/ratings/average?songId=${songId}`
          );
          if (!avgResponse.ok)
            throw new Error("Failed to fetch updated rating");
          const data = await avgResponse.json();
          setAverageRating(data.average);
        } catch (error) {
          console.error("Failed to submit rating:", error);
        }
      };

      useEffect(() => {
        const fetchAverageRating = async () => {
          try {
            const response = await fetch(
              `/api/ratings/average?songId=${songId}`
            );
            if (!response.ok) throw new Error("Failed to fetch rating");
            const data = await response.json();
            setAverageRating(data.average);
          } catch (error) {
            console.error("Error fetching rating:", error);
          }
        };

        fetchAverageRating();
      }, [songId]);

      return (
        <>
          <div className="flex items-center gap-1">
            {session ? (
              <button
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-1 hover:text-purple-300"
              >
                <span className="text-sm">{averageRating}</span>
                <Star className="h-4 w-4 fill-current" />
              </button>
            ) : (
              <>
                <span className="text-sm">{averageRating}</span>
                <Star className="h-4 w-4 fill-current" />
              </>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rate "{songTitle}"</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <Rating
                  style={{ maxWidth: 250 }}
                  value={currentRating}
                  onChange={(newRating: number) => {
                    setCurrentRating(newRating);
                    handleRatingSubmit(newRating);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
  {
    accessorKey: "dateUploaded",
    header: "Uploaded",
    sortingFn: "datetime",
    sortDescFirst: true,
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
    id: "manageActions",
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
