import axios from "axios";
import chalk from "chalk";

const API_BASE_URL = "https://www.googleapis.com/youtube/v3";

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
            `Watch this 3 min. tutorial on how to get a YouTube API key (v3) - ${chalk.underline(
              "https://youtu.be/N18czV5tj5o"
            )}`
        );
      default:
        return chalk.red("Your API key is not working. Please try again.");
    }
  }
}
