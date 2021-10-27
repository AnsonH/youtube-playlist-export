export const axiosErrorResponse = (status, reason) => ({
  response: {
    status,
    data: {
      error: {
        code: 404,
        errors: [{ reason }],
      },
    },
  },
});

export const defaultConfig = {
  apiKey: "",
  exportItems: {
    position: true,
    title: true,
    uploader: true,
    uploaderUrl: false,
    url: true,
    description: false,
    videoPrivacy: false,
    publishTime: false,
  },
  fileExt: "json",
  folderPath: "C:\\Users\\User\\ytpl-export\\",
  notifyUpdate: true,
  skipPrivateOrDeleted: true,
};

// Fake playlist for testing
export const playlist = {
  playlistId: "PL12345678",
  title: "My Fake Playlist",
  numOfVideos: 3,
  // Mock response for `getPlaylistMetadata`
  playlistMetadata: {
    title: "My Fake Playlist",
    numOfVideos: 3,
  },
  fileNameJson: "2021-10-15-My_Fake_Playlist.json",
  fileNameCsv: "2021-10-15-My_Fake_Playlist.csv",
  // Mock Axios data response for `/playlistItems`
  // This fake playlist has 1 public, 1 private, and 1 deleted video
  playlistItemsData: {
    items: [
      {
        snippet: {
          publishedAt: "2013-10-18T14:55:24Z",
          title: "My Public Video",
          description: "lorem 0",
          position: 0,
          resourceId: { videoId: "abCDef0" },
          videoOwnerChannelTitle: "Google",
          videoOwnerChannelId: "UC-google",
        },
        status: { privacyStatus: "public" },
      },
      {
        snippet: {
          publishedAt: "2011-09-23T04:52:44Z",
          title: "Private video",
          description: "This video is private.",
          position: 1,
          resourceId: { videoId: "abCDef1" },
        },
        status: { privacyStatus: "private" },
      },
      {
        snippet: {
          publishedAt: "2019-11-10T02:22:17Z",
          title: "Deleted video",
          description: "This video is unavailable.",
          position: 2,
          resourceId: { videoId: "abCDef2" },
        },
        status: { privacyStatus: "privacyStatusUnspecified" },
      },
    ],
    pageInfo: { totalResults: 3 },
  },
  // Mock Axios data response for `/playlists`
  playlistsData: {
    items: [{ snippet: { title: "My Fake Playlist" } }],
  },
  // JSON output with all fields, including private/deleted videos
  fullJsonOutput: [
    {
      position: 0,
      title: "My Public Video",
      uploader: "Google",
      uploaderUrl: "https://www.youtube.com/channel/UC-google",
      url: "https://youtu.be/abCDef0",
      description: "lorem 0",
      videoPrivacy: "public",
      publishTime: "2013-10-18T14:55:24Z",
    },
    {
      position: 1,
      title: "Private video",
      uploader: null,
      uploaderUrl: null,
      url: "https://youtu.be/abCDef1",
      description: null,
      videoPrivacy: "private",
      publishTime: "2011-09-23T04:52:44Z",
    },
    {
      position: 2,
      title: "Deleted video",
      uploader: null,
      uploaderUrl: null,
      url: "https://youtu.be/abCDef2",
      description: null,
      videoPrivacy: "deleted",
      publishTime: "2019-11-10T02:22:17Z",
    },
  ],
};

export const exportItemsAll = [
  "position",
  "title",
  "uploader",
  "uploaderUrl",
  "url",
  "description",
  "videoPrivacy",
  "publishTime",
];
