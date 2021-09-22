<div align="center">
  <img src="./assets/logo.svg" width="100" height="100" alt="Logo">
  <h1>youtube-playlist-export</h1>
  <p>Node.js command line app for exporting video data from a YouTube playlist to a JSON/CSV file.</p>
  <img src="./assets/demo.gif" width="720" alt="Demo">
</div>

## About

This app lets you download the metadata of each video (e.g. video title, URL, uploader, and etc.) from a public/unlisted YouTube playlist and saves it to a JSON or CSV file.

> 🚨 This app does **not** download videos from a YouTube playlist. It only downloads **text-based metadata** of videos from a playlist.

## Installation

> ⚠️ Requires **Node v12** or higher.

1. Install the app:
   ```
   $ npm install -g youtube-playlist-export
   ```
2. Run the following command in Terminal to confirm that it's properly installed:
   ```
   $ ytpl-export --help
   ```
3. Get a YouTube API v3 key for free:

   - 3 min. YouTube tutorial - [How to Get YouTube API Key 2021](https://youtu.be/N18czV5tj5o)
   - RapidAPI blog article - [How To Get a YouTube API Key (in 7 Simple Steps)](https://rapidapi.com/blog/how-to-get-youtube-api-key/)

4. Run the following command and follow the on-screen instructions to register the YouTube API key:
   ```
   $ ytpl-export key
   ```

## Usage

```
$ ytpl-export --help
```

```
Exports video data from a YouTube playlist to JSON/CSV file.

Usage: ytpl-export [options] [command]

Options:
  -V, --version              output the version number
  -h, --help                 display help for command

Commands:
  id [options] <playlistId>  Export video metadata of a playlist by its playlist ID.
  key                        Manage your YouTube API key.
  config [options]           Edit configurations of this app.
  help [command]             display help for command
```

## Development

```
$ npm install
```

## Limitations

This app uses [YouTube API v3](https://developers.google.com/youtube/v3/) under the hood. However, due to limitations of the API, it **cannot** perform the following actions:

- Export your "Watch Later" playlist
- Export private playlists
- Export most metadata of deleted or private videos, such as the original video title and description
- Download each video, not its metadata, in mp3, mp4, wmv, or other formats

## Related Work

- [youtube-playlist-summary](https://www.npmjs.com/package/youtube-playlist-summary) - A module for getting YouTube playlist data
- [usetube](https://www.npmjs.com/package/usetube) - A module for crawling YouTube data without a YouTube API key
