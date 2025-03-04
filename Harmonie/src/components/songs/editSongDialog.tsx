"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { tags } from "@/data/tags";
import { TagSelector } from "@/components/tagSelector";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditSongDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  song: {
    id: string;
    title: string;
    tags: string;
    source: string;
    comment: string | null;
  };
  onSongEdited: () => void;
}

export function EditSongDialog({
  isOpen,
  onOpenChange,
  song,
  onSongEdited,
}: EditSongDialogProps) {
  const [title, setTitle] = useState(song.title);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    Array.isArray(song.tags)
      ? song.tags
      : typeof song.tags === "string" && song.tags.length > 0
      ? song.tags.split(",").map(tag => tag.trim())
      : []
  );
  const [comment, setComment] = useState(song.comment || "");
  const [source, setSource] = useState(song.source);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || selectedTags.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Title and tags are required",
      });
      return;
    }

    try {
      const response = await fetch("/api/songs/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: song.id,
          title,
          tags: selectedTags,
          comment,
          source,
        }),
      });

      if (!response.ok) throw new Error("Failed to update song");

      toast({
        title: "Success",
        description: "Song updated successfully",
      });

      onOpenChange(false);
      onSongEdited();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update song",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit &ldquo;{song.title}&rdquo;</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter song title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <TagSelector value={selectedTags} onChange={setSelectedTags} />
          </div>
          <div>
            <label htmlFor="source" className="block text-sm font-medium mb-1">
              Source
            </label>
            <Input
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Enter source (e.g., YouTube URL)"
            />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-1">
              Comment
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any comments about the song"
              rows={3}
            />
          </div>
          <Button type="submit">Update Song</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
