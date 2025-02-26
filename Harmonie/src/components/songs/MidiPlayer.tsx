import { useEffect, useState, useCallback, useRef } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface Track {
  name: string;
  channel: number;
  enabled: boolean;
  notes: any[];
}

interface MidiPlayerProps {
  songId: string;
  download?: string;
  origin?: string;
}

export function MidiPlayer({ songId, download, origin }: MidiPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [synth, setSynth] = useState<Tone.PolySynth | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const timeUpdateInterval = useRef<number | null>(null);

  const resetPlayback = useCallback(() => {
    setIsPlaying(false);
    Tone.Transport.stop();
    Tone.Transport.seconds = 0;
    setCurrentTime(0);
    setProgress(0);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const setupPlayback = useCallback(() => {
    Tone.Transport.cancel();

    // Find the latest note end time
    let latestEndTime = 0;
    tracks.forEach((track) => {
      if (track.enabled && track.notes.length > 0) {
        track.notes.forEach((note) => {
          const noteEndTime = note.time + note.duration;
          latestEndTime = Math.max(latestEndTime, noteEndTime);
        });
      }
    });

    // Schedule all notes
    tracks.forEach((track) => {
      if (track.enabled) {
        track.notes.forEach((note) => {
          Tone.Transport.schedule((time) => {
            synth?.triggerAttackRelease(
              note.name,
              note.duration,
              time,
              note.velocity
            );
          }, note.time);
        });
      }
    });

    // Schedule the end of playback
    Tone.Transport.schedule(() => {
      resetPlayback();
    }, latestEndTime);
  }, [tracks, synth, resetPlayback]);

  const fetchAndCacheMidiFile = async (url: string): Promise<ArrayBuffer> => {
    // Try to get from cache first
    try {
      const cache = await caches.open("midi-cache");
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        return await cachedResponse.arrayBuffer();
      }

      // If not in cache, fetch and cache
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();

      // Clone the response before caching because response body can only be used once
      const responseToCache = new Response(buffer);
      await cache.put(url, responseToCache);

      return buffer;
    } catch (error) {
      console.error("Error fetching/caching MIDI file:", error);
      throw error;
    }
  };

  const getMidiData = async (): Promise<ArrayBuffer> => {
    if (origin === "bmp" && download) {
      const proxyUrl = `/api/songs/proxy?url=${encodeURIComponent(download)}`;
      return fetchAndCacheMidiFile(proxyUrl);
    } else {
      const response = await fetch(`/api/songs/midi/${songId}`);
      return response.arrayBuffer();
    }
  };

  useEffect(() => {
    const initPlayer = async () => {
      setIsLoading(true);
      try {
        const arrayBuffer = await getMidiData();
        const midi = new Midi(arrayBuffer);

        const midiTracks = midi.tracks.map((track, index) => ({
          name: track.name || `Track ${index + 1}`,
          channel: track.channel,
          enabled: true,
          notes: track.notes,
        }));

        setTracks(midiTracks);
        setDuration(midi.duration);

        const newSynth = new Tone.PolySynth().toDestination();
        setSynth(newSynth);
      } catch (error) {
        console.error("Error loading MIDI file:", error);
      }
      setIsLoading(false);
    };

    initPlayer();

    return () => {
      if (timeUpdateInterval.current) {
        window.clearInterval(timeUpdateInterval.current);
      }
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, [songId, origin, download]);

  useEffect(() => {
    if (isPlaying) {
      timeUpdateInterval.current = window.setInterval(() => {
        const time = Tone.Transport.seconds;

        // Check if we've reached the end
        if (time >= duration) {
          resetPlayback();
          return;
        }

        setCurrentTime(time);
        setProgress((time / duration) * 100);
      }, 16);
    } else {
      if (timeUpdateInterval.current) {
        window.clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = null;
      }
    }

    return () => {
      if (timeUpdateInterval.current) {
        window.clearInterval(timeUpdateInterval.current);
      }
    };
  }, [isPlaying, duration, resetPlayback]);

  useEffect(() => {
    setupPlayback();
  }, [tracks, setupPlayback]);

  const togglePlay = async () => {
    if (!synth) return;

    if (isPlaying) {
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      // If we're at the end, reset to beginning
      if (currentTime >= duration) {
        Tone.Transport.seconds = 0;
        setCurrentTime(0);
        setProgress(0);
      }
      await Tone.start();
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const toggleTrack = (index: number) => {
    setTracks(
      tracks.map((track, i) =>
        i === index ? { ...track, enabled: !track.enabled } : track
      )
    );
  };

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    Tone.Transport.seconds = newTime;
    setCurrentTime(newTime);
    setProgress(value[0]);

    // If we're at the end and seeking backwards, reset playback
    if (currentTime >= duration && newTime < duration) {
      setupPlayback();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg border">
      <div className="flex flex-col gap-2">
        <div className="text-sm font-medium">Tracks:</div>
        {tracks.map((track, index) => (
          <div key={index} className="flex items-center gap-2">
            <Checkbox
              checked={track.enabled}
              onCheckedChange={() => toggleTrack(index)}
              id={`track-${index}`}
            />
            <label htmlFor={`track-${index}`} className="text-sm">
              {track.name}
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Slider
          value={[progress]}
          min={0}
          max={100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <Button onClick={togglePlay} className="flex items-center gap-2">
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {isPlaying ? "Pause" : "Play"}
      </Button>
    </div>
  );
}
