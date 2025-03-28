import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Play, Pause, Volume2, MoreVertical, Download } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/UserContext";
import { downloadSongs } from "@/utils/downloadSongs";
import { Sequencer, Synthetizer, WORKLET_URL_ABSOLUTE, MIDI } from "spessasynth_lib";

interface Track {
  name: string;
  channel: Set<number>;
  enabled: boolean;
  port: number;
}

interface MidiPlayerProps {
  songId: string;
  download?: string;
  origin?: string;
  song?: any;
  onClose?: () => void;
}

export function MidiPlayer({ songId, download, origin, song, onClose }: MidiPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [synth, setSynth] = useState<Synthetizer | null>(null);
  const [sequencer, setSequencer] = useState<Sequencer | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem("midiPlayerVolume");
    return savedVolume ? parseInt(savedVolume) : 50;
  });
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  const timeUpdateInterval = useRef<number | null>(null);
  const firstLoad = useRef(true);
  const { autoplayEnabled, toggleAutoplay } = useUser();

  const resetPlayback = useCallback(() => {
    setIsPlaying(false);
    if (sequencer) {
      sequencer.pause();
      sequencer.currentTime = 0;
    }
    setCurrentTime(0);
    setProgress(0);
  }, [sequencer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

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

  const getMidiData = useCallback(async (): Promise<ArrayBuffer> => {
    if (origin === "bmp" && download) {
      const proxyUrl = `/api/songs/proxy?url=${encodeURIComponent(download)}`;
      return fetchAndCacheMidiFile(proxyUrl);
    } else {
      const response = await fetch(`/api/songs/midi/${songId}`);
      return response.arrayBuffer();
    }
  }, [songId, origin, download]);

  useEffect(() => {
    const initPlayer = async () => {
      setIsLoading(true);
      try {
        const arrayBuffer = await getMidiData();
        const midi = new MIDI(arrayBuffer);

        // Create tracks based on MIDI ports and used channels
        const midiTracks = Array.from({ length: midi.tracksAmount }, (_, index) => {
          // Get track name from MIDI data or use default
          let trackName = `Track ${index + 1}`;
          if (index === 0 && midi.midiName) {
            trackName = midi.midiName;
          } else {
            // Try to get track name from the track's events
            const track = midi.tracks[index];
            if (track) {
              for (const event of track) {
                // Meta event for track name is 0x03
                if (event.messageStatusByte === 0x03) {
                  trackName = new TextDecoder().decode(event.messageData);
                  break;
                }
              }
            }
          }
          
          return {
            name: trackName,
            channel: midi.usedChannelsOnTrack[index] || new Set(),
            port: midi.midiPorts[index] || 0,
            enabled: true
          };
        });

        setTracks(midiTracks);

        // Initialize AudioContext and SpessaSynth
        const ctx = new AudioContext();
        await ctx.audioWorklet.addModule(WORKLET_URL_ABSOLUTE);
        
        const response = await fetch('/soundfonts/default.sf2');
        const soundFontBuffer = await response.arrayBuffer();
        
        const newSynth = new Synthetizer(ctx.destination, soundFontBuffer);
        setAudioContext(ctx);
        setSynth(newSynth);

        // Create initial sequencer
        console.log("creating sequencer");
        const newSequencer = new Sequencer(
          [{
            binary: arrayBuffer,
            altName: "Current Song"
          }], 
          newSynth,
          {
            autoPlay: false,
            skipToFirstNoteOn: false,
            preservePlaybackState: false
          }
        );
        setSequencer(newSequencer);
        setDuration(midi.duration); // Use MIDI duration instead of sequencer duration
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
      if (sequencer) {
        sequencer.pause();
      }
      audioContext?.close();
    };
  }, [songId, origin, download, getMidiData]);

  useEffect(() => {
    if (!isLoading && autoplayEnabled && !isPlaying && synth && firstLoad.current && sequencer) {
      firstLoad.current = false;
      console.log("autoplaying");
      sequencer.play();
      setIsPlaying(true);
    }
  }, [isLoading, autoplayEnabled, isPlaying, synth, sequencer]);

  useEffect(() => {
    if (sequencer && synth) {
      // Apply current track states
      tracks.forEach((track, index) => {
        track.channel.forEach(channel => {
          const actualChannel = channel + (track.port * 16);
          synth.muteChannel(actualChannel, !track.enabled);
        });
      });
    }
  }, [tracks, sequencer, synth]);

  useEffect(() => {
    if (synth) {
      synth.setMainVolume(volume / 100)
    }
  }, [volume, synth]);

  useEffect(() => {
    if (isPlaying && sequencer) {
      timeUpdateInterval.current = window.setInterval(() => {
        const time = sequencer.currentTime;

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
  }, [isPlaying, duration, resetPlayback, sequencer]);

  const togglePlay = async () => {
    if (!sequencer) return;

    if (isPlaying) {
      sequencer.pause();
      setIsPlaying(false);
    } else {
      // If we're at the end, reset to beginning
      if (currentTime >= duration) {
        sequencer.currentTime = 0;
        setCurrentTime(0);
        setProgress(0);
      }
      console.log("playing");
      sequencer.play();
      setIsPlaying(true);
    }
  };

  const toggleTrack = (index: number) => {
    const newTracks = tracks.map((track, i) =>
      i === index ? { ...track, enabled: !track.enabled } : track
    );
    setTracks(newTracks);

    // Update sequencer channel states
    if (sequencer && synth) {
      const track = newTracks[index];
      if (track) {
        track.channel.forEach(channel => {
          const actualChannel = channel + (track.port * 16);
          synth.muteChannel(actualChannel, !track.enabled);
        });
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (!sequencer) return;
    
    const newTime = (value[0] / 100) * duration;
    sequencer.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    localStorage.setItem("midiPlayerVolume", newVolume.toString());
    if (synth) {
      synth.setMainVolume(volume / 100)
    }
  };

  useEffect(() => {
    return () => {
      if (timeUpdateInterval.current) {
        window.clearInterval(timeUpdateInterval.current);
      }
      if (sequencer) {
        sequencer.pause();
        sequencer.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
      audioContext?.close();
    };
  }, [sequencer]);

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
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            Tracks (
            <span className="font-bold">
              {tracks.filter((t) => t.enabled).length}
            </span>
            /<span className="font-bold">{tracks.length}</span>) :
          </div>
        </div>
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

      <div className="flex items-center gap-4">
        <Button
          onClick={togglePlay}
          variant="outline"
          className="flex items-center gap-2 w-10 h-10"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm text-gray-500 w-10 text-center">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[progress]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-sm text-gray-500 w-10 text-center">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onMouseEnter={() => setShowVolumeTooltip(true)}
                  onMouseLeave={() => setShowVolumeTooltip(false)}
                  className="relative"
                >
                  <Slider
                    value={[volume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      handleVolumeChange(value);
                      setShowVolumeTooltip(true);
                    }}
                    className="w-20"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={15}>
                <p className="text-sm">{volume}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleAutoplay}>
                {autoplayEnabled ? "Disable autoplay" : "Enable autoplay"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
