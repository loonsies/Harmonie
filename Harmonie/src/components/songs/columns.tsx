"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Song } from "@/data/types/song";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, Star, Play, Pencil } from "lucide-react";
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
import { MidiPlayer } from "@/components/songs/midiPlayer";
import { EditSongDialog } from "@/components/songs/editSongDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getTagLabel = (value: string) => {
  const tag = tags.find((t) => t.value === value);
  return tag ? tag.label : value;
};

// Action Cell Component
const ActionCell = ({ row, table }: { row: any; table: any }) => {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const song = row.original;

  return (
    <>
      <div className="flex gap-1">
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
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle>{song.title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2 mr-2">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select song"
                className="align-middle"
              />
              <Button
                onClick={() => downloadSongs([song])}
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-2"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <MidiPlayer
            songId={song.id}
            download={song.download}
            origin={song.origin}
            song={song}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

// Author Cell Component
const AuthorCell = ({ row }: { row: any }) => {
  const router = useRouter();
  const origin = row.getValue("origin") as string;
  const author = row.original.authorName;

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
};

// Rating Cell Component
const RatingCell = ({ row }: { row: any }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const { data: session } = useSession();
  const songTitle = row.getValue("title") as string;
  const songId = row.original.id;
  const [averageRating, setAverageRating] = useState(
    row.original.averageRating
  );

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
      const avgResponse = await fetch(`/api/ratings/average?songId=${songId}`);
      if (!avgResponse.ok) throw new Error("Failed to fetch updated rating");
      const data = await avgResponse.json();
      setAverageRating(data.average);
    } catch (error) {
      console.error("Failed to submit rating:", error);
    }
  };

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
            <DialogTitle>&quot;{songTitle}&quot;</DialogTitle>
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
};

// ManageActions Cell Component
const ManageActionsCell = ({ row }: { row: any }) => {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

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
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete song",
      });
    }
  };

  return (
    <div className="flex gap-1">
      <Button
        className="h-8 w-8 p-2 align-middle"
        variant="ghost"
        size="icon"
        onClick={() => setIsEditDialogOpen(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="text-destructive hover:text-destructive/90 h-8 w-8 p-2 align-middle"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <EditSongDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        song={row.original}
        onSongEdited={() => router.refresh()}
      />
    </div>
  );
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
    cell: ({ row, table }) => <ActionCell row={row} table={table} />,
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
    cell: ({ row }) => <AuthorCell row={row} />,
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

      const displayTags = tagList.slice(0, 3);
      const remainingTags = tagList.slice(3);
      const hasMoreTags = remainingTags.length > 0;

      return (
        <div className="flex gap-1">
          {displayTags.map((tag) => (
            <Badge key={tag} variant="outline">
              {getTagLabel(tag)}
            </Badge>
          ))}
          {hasMoreTags && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="cursor-help">
                    ...
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-wrap gap-1">
                    {remainingTags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {getTagLabel(tag)}
                      </Badge>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
    filterFn: "arrIncludesSome",
  },
  {
    id: "rating",
    header: "Rating",
    cell: ({ row }) => <RatingCell row={row} />,
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
    cell: ({ row }) => <ManageActionsCell row={row} />,
  },
];
