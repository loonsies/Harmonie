import { toast } from "@/hooks/use-toast";

interface Song {
  id: string;
  title: string;
  download: string;
  origin: string;
}

export const downloadSongs = async (songs: Song[]) => {
  try {
    toast({
      title: `Downloading ${songs.length} song${
        songs.length > 1 ? "s" : ""
      }...`,
      description: "Please wait while we download the songs...",
    });
    for (const song of songs) {
      if (song.origin === "bmp") {
        // Open download link in new tab for BMP songs
        const newWindow = window.open(song.download, "_blank");

        if (newWindow === null) {
          toast({
            title: "Popup Blocked",
            description: "Please allow popups to download songs from BMP",
            variant: "destructive",
          });
        } else {
          console.log(`Opening download link for ${song.title} in new tab`);
        }
      } else if (song.origin === "harmonie") {
        // Download Harmonie songs from public/midi folder
        const response = await fetch(`/midi/${song.download}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = song.title + ".mid";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log(`Downloaded Harmonie song: ${song.title}`);
      } else {
        console.log(`Unknown origin ${song.origin} for song: ${song.title}`);
      }
    }
  } catch (error) {
    console.error("Error downloading songs:", error);
  }
};
