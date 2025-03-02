# Harmonie

<p align="center">
  <img src="https://github.com/loonsies/Harmonie/blob/main/assets/logo.png?raw=true" alt="Harmonie Logo" width="48"/>
</p>

Harmonie is a Next.js application designed to enhance the FFXIV bard music browsing experience. It provides an easy-to-use interface for discovering and filtering songs that can be played with MBard, addressing the lack of sorting and filtering capabilities on songs.bardmusicplayer.com

This is a hobby project, nothing more. I like chilling in Gridania and playing music with friends, so I made this.

## Features

- 🎵 Browse FFXIV bard songs with advanced filtering and sorting options
- 🎼 Preview songs before downloading (with individual track control)
- ⭐ Rate songs and share your feedback with the community
- 📤 Upload and share your own bard songs
- 🔄 Regular updates from BardMusicPlayer (fetched twice daily)

## Technical Details

- The application fetches data from BardMusicPlayer only twice per day, with the same resource impact as a regular page visit
- Songs are downloaded from BardMusicPlayer's servers for MIDI preview functionality on the fly and cached on our server for one year to avoid hammering them with requests
- Built using Next.js for server-side rendering and optimal performance

## Ethical Considerations

We respect BardMusicPlayer's resources by:

- Limiting our fetches to twice daily
- Using standard page loads like any normal user
- Implementing extensive caching to minimize repeated downloads

## Contributing

Feel free to contribute to this project by submitting issues or pull requests.

## License

This project is open source and available under the MIT license.
