import { useEffect, useState } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface Track {
  name: string;
  channel: number;
  enabled: boolean;
}

interface MidiPlayerProps {
  songId: string;
}

export function MidiPlayer({ songId }: MidiPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [synth, setSynth] = useState<Tone.PolySynth | null>(null);

  useEffect(() => {
    const initPlayer = async () => {
      setIsLoading(true);
      try {
        // Fetch the MIDI file
        const response = await fetch(`/api/songs/midi/${songId}`);
        const arrayBuffer = await response.arrayBuffer();

        // Parse MIDI file
        const midi = new Midi(arrayBuffer);

        // Initialize tracks
        const midiTracks = midi.tracks.map((track, index) => ({
          name: track.name || `Track ${index + 1}`,
          channel: track.channel,
          enabled: true,
        }));

        setTracks(midiTracks);

        // Initialize synth
        const newSynth = new Tone.PolySynth().toDestination();
        setSynth(newSynth);

        // Set up MIDI playback
        // This is a simplified version - you'll want to add more sophisticated
        // playback logic based on your needs
        midi.tracks.forEach((track, index) => {
          track.notes.forEach((note) => {
            if (midiTracks[index].enabled) {
              Tone.Transport.schedule((time) => {
                newSynth.triggerAttackRelease(
                  note.name,
                  note.duration,
                  time,
                  note.velocity
                );
              }, note.time);
            }
          });
        });
      } catch (error) {
        console.error("Error loading MIDI file:", error);
      }
      setIsLoading(false);
    };

    initPlayer();

    return () => {
      // Cleanup
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, [songId]);

  const togglePlay = async () => {
    if (!synth) return;

    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
    } else {
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
    // You'll need to update the playback here based on enabled tracks
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {tracks.map((track, index) => (
          <div key={index} className="flex items-center gap-2">
            <Checkbox
              checked={track.enabled}
              onCheckedChange={() => toggleTrack(index)}
              id={`track-${index}`}
            />
            <label htmlFor={`track-${index}`}>{track.name}</label>
          </div>
        ))}
      </div>

      <Button onClick={togglePlay}>{isPlaying ? "Stop" : "Play"}</Button>
    </div>
  );
}
