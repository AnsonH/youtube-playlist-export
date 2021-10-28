import axios from "axios";
import c from "chalk";
import ProgressBar from "progress";
import * as api from "./api";
import Config from "./Config";
import { getValue } from "../utils/index";

export const API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const MAX_RESULTS = 50; // Max. no. of items returned in one call (50 is the max. value allowed)
const PROGRESS_BAR_WIDTH = 40;

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
    return c.red("Please enter a non-empty API key");
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
      return c.red("Error in network connection. Please check your Internet connection.");
    }

    const statusCode = error.response.status;
    switch (statusCode) {
      case 400:
        return c.red(
          "Your API key is invalid. Did you obtain the API key correctly?\n" +
            // prettier-ignore
            `Watch this 3 min. tutorial on how to get a YouTube API key (v3) - ${c.underline("https://youtu.be/N18czV5tj5o")}`
        );
      default:
        return c.red("Your API key is not working. Please try again.");
    }
  }
}

/**
 * Fetches playlist metadata (eg. No. of videos, no. of pages)
 * @param {string} playlistId
 */
export async function getPlaylistMetadata(playlistId) {
  const config = new Config();
  const apiKey = config.get("apiKey");

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
    };
  } catch (error) {
    api.throwError(error);
  }
}

/**
 * Fetches playlist data.
 * @param {string} playlistId
 * @param {string[]} exportItems  Key names of items to be exported
 * @param {number} numOfVideos   No. of pages in the playlist
 * @returns {object[]}  Data in JSON form.
 */
export async function getPlaylistData(playlistId, exportItems, numOfVideos) {
  const config = new Config();
  const apiKey = config.get("apiKey");

  try {
    const playlistData = [];

    const numOfPages = Math.ceil(numOfVideos / MAX_RESULTS);
    let nextPageToken = null;

    const progressBar = new ProgressBar(
      `Fetching playlist data |${c.cyan(":bar")}| :current/:total (:percent)`,
      {
        total: numOfVideos,
        width: PROGRESS_BAR_WIDTH,
        complete: "\u2588",
        incomplete: "\u2591",
      }
    );

    for (let page = 0; page < numOfPages; ++page) {
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
        const isPrivate = item.status.privacyStatus === "private";
        const isDeleted = item.snippet.title === "Deleted video";

        // Ignore private/deleted videos
        if (config.get("skipPrivateOrDeleted") && (isPrivate || isDeleted)) {
          progressBar.tick();
          return;
        }

        const entry = {};

        exportItems.forEach((exportItem) => {
          let data = getValue(item, exportItemsMap[exportItem]) ?? null;
          switch (exportItem) {
            case "description":
              if (isPrivate || isDeleted) {
                data = null;
              }
              break;
            case "uploaderUrl":
              data = isPrivate || isDeleted ? null : `https://www.youtube.com/channel/${data}`;
              break;
            case "url":
              data = `https://youtu.be/${data}`;
              break;
            case "videoPrivacy":
              if (isDeleted) {
                data = "deleted";
              }
              break;
          }

          entry[exportItem] = data;
        });

        playlistData.push(entry);
        progressBar.tick();
      });
    }

    return playlistData;
  } catch (error) {
    api.throwError(error);
  }
}

/**
 * Handles API fetch errors by throwing a stringified object containing the status code and error reason.
 * @param {*} error Response returned by Axios
 */
export function throwError(error) {
  const details = {
    status: error.response.status,
    reason: error.response.data.error.errors[0].reason,
  };

  throw new Error(JSON.stringify(details));
}
