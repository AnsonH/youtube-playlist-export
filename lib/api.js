import axios from "axios";
import chalk from "chalk";
import Config from "./Config.js";
import { getValue } from "../utils/index.js";

const API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const MAX_RESULTS = 50; // Max. no. of items to be returned in one call (50 is the max. value allowed)

/**
 * Mapping from export item key names to the properties of each object in the `response.data.items` array
 * returned by YouTube API (`/playlistId`).
 */
const exportItemsMap = {
  position: "snippet.position",
  title: "snippet.title",
  uploader: "snippet.videoOwnerChannelTitle",
  uploaderUrl: "snippet.videoOwnerChannelId",
  url: "snippet.resourceId.videoId",
  description: "snippet.description",
  videoPrivacy: "status.privacyStatus",
  publishTime: "snippet.publishedAt",
};

/**
 * Validates the entered YouTube API key.
 * @param {string} apiKey
 */
export async function validateApiKey(apiKey) {
  if (apiKey.length === 0) {
    return chalk.red("Please enter a non-empty API key");
  }

  // Try out the API key
  try {
    await axios(`${API_BASE_URL}/playlistItems`, {
      params: {
        key: apiKey,
        part: "id",
        playlistId: "PLBCF2DAC6FFB574DE",
      },
    });

    return true;
  } catch (error) {
    if (error.response === undefined) {
      return chalk.red("You are not connected to the Internet.");
    }

    const statusCode = error.response.status;
    switch (statusCode) {
      case 400:
        return chalk.red(
          "Your API key is invalid. Did you obtain the API key correctly?\n" +
            // prettier-ignore
            `Watch this 3 min. tutorial on how to get a YouTube API key (v3) - ${chalk.underline("https://youtu.be/N18czV5tj5o")}`
        );
      default:
        return chalk.red("Your API key is not working. Please try again.");
    }
  }
}

/**
 * Fetches playlist metadata (eg. No. of videos, no. of pages)
 * @param {string} playlistId
 */
export async function getPlaylistMetadata(playlistId) {
  const config = new Config();
  const apiKey = config.apiKey;

  try {
    const itemsResponse = await axios(`${API_BASE_URL}/playlistItems`, {
      params: {
        key: apiKey,
        part: "id",
        playlistId,
        maxResults: 1, // Actual playlist data is not fetched here so it doesn't matter
      },
    });

    const playlistResponse = await axios(`${API_BASE_URL}/playlists`, {
      params: {
        key: apiKey,
        part: "snippet",
        id: playlistId,
      },
    });

    const title = playlistResponse.data.items[0].snippet.title;
    const numOfVideos = itemsResponse.data.pageInfo.totalResults;

    return {
      title,
      numOfVideos,
      numOfPages: Math.ceil(numOfVideos / MAX_RESULTS),
    };
  } catch (error) {
    throwError(error);
  }
}

/**
 * Fetches playlist data.
 * @param {string} playlistId
 * @param {string[]} exportItems  Key names of items to be exported
 * @param {number} numOfPages   No. of pages of the playlist
 */
export async function getPlaylistData(playlistId, exportItems, numOfPages) {
  const config = new Config();
  const apiKey = config.apiKey;

  try {
    const playlistData = [];
    let nextPageToken = null; // Token of next page (if any)

    for (let i = 0; i < numOfPages; ++i) {
      const { data } = await axios(`${API_BASE_URL}/playlistItems`, {
        params: {
          key: apiKey,
          part: "snippet, status",
          playlistId,
          maxResults: MAX_RESULTS,
          pageToken: nextPageToken,
        },
      });

      nextPageToken = data.nextPageToken ?? null;

      data.items.forEach((item) => {
        // Ignore private videos
        if (item.status.privacyStatus === "private") {
          return;
        }

        const entry = {};

        exportItems.forEach((exportItem) => {
          let data = getValue(item, exportItemsMap[exportItem]);

          switch (exportItem) {
            case "uploaderUrl":
              data = "https://www.youtube.com/channel/" + data;
              break;
            case "url":
              data = "https://youtu.be/" + data;
              break;
          }

          entry[exportItem] = data;
        });

        playlistData.push(entry);
      });
    }

    return playlistData;
  } catch (error) {
    throwError(error);
  }
}

/**
 * Handles API fetch errors by throwing a stringified object containing the status code and error reason.
 * @param {*} error Response returned by Axios
 */
function throwError(error) {
  const details = {
    status: error.response.status,
    reason: error.response.data.error.errors[0].reason,
  };

  throw new Error(JSON.stringify(details));
}
