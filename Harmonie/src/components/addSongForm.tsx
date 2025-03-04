"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { tags } from "@/data/tags";
import { TagSelector } from "@/components/tagSelector";
import { Textarea } from "@/components/ui/textarea";

export function AddSongForm({ onSongAdded }: { onSongAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [source, setSource] = useState("");
  const [midiFile, setMidiFile] = useState<File | null>(null);
  const [formKey, setFormKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || selectedTags.length === 0 || !midiFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Title, tags, and MIDI file are required",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("tags", JSON.stringify(selectedTags));
    formData.append("comment", comment);
    formData.append("source", source);
    formData.append("midiFile", midiFile);

    try {
      const response = await fetch("/api/songs/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add song");

      toast({
        title: "Success",
        description: "Song added successfully",
      });

      setTitle("");
      setSelectedTags([]);
      setComment("");
      setSource("");
      setMidiFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFormKey(prev => prev + 1);
      onSongAdded();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add song",
      });
    }
  };

  return (
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
        <TagSelector 
          key={formKey} 
          value={selectedTags} 
          onChange={setSelectedTags} 
        />
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
      <div>
        <label htmlFor="midi" className="block text-sm font-medium mb-1">
          MIDI File
        </label>
        <Input
          id="midi"
          ref={fileInputRef}
          type="file"
          accept=".mid,.midi"
          onChange={(e) => setMidiFile(e.target.files?.[0] || null)}
          className="py-0"
          required
        />
      </div>
      <Button type="submit">Add Song</Button>
    </form>
  );
}
