import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { getPlaylistData, getPlaylistMetadata } from "../lib/api.js";
import Config from "../lib/Config.js";

/**
 * Action handler for `ytpl-export id [options] <playlistId>`
 * @param {string} playlistId   Command argument - ID of playlist to be exported
 * @param {{default: boolean}} options  Command options
 */
const idActionHandler = async (playlistId, options) => {
  const config = new Config();

  // Check for "Watch Later"
  if (playlistId === "WL") {
    console.log(
      chalk.yellow(
        "WARNING: Videos in Watch Later playlist cannot be retrieved through the YouTube API."
      )
    );
    console.log(chalk.yellow("Please try another playlist."));
    return;
  }

  // Check if API key exists
  if (!config.apiKey) {
    console.log(`${chalk.yellow("WARNING:")} You haven't set your YouTube API key!`);
    console.log(`Run ${chalk.cyan("`ytpl-export key`")} to set the API key.`);
    return;
  }

  // Fetch playlist metadata
  const metaSpinner = ora("Fetching playlist metadata...").start();
  let metadata;

  try {
    metadata = await getPlaylistMetadata(playlistId);
    metaSpinner.succeed("Fetched playlist metadata");
  } catch (error) {
    metaSpinner.fail("Failed in fetching playlist metadata");
    handleApiError(error);
    return;
  }

  console.log(`▶ Playlist Title: ${chalk.magenta(metadata.title)}`);
  console.log(
    `▶ Number of videos (including private videos): ${chalk.magenta(metadata.numOfVideos)}`
  );

  // Check if playlist is empty
  if (metadata.numOfVideos === 0) {
    console.log(chalk.green("This playlist is empty and there are no video data to export."));
    return;
  }

  // User prompt
  let playlistData;

  if (options.default) {
    // Skip all prompts for `--default` option
    const exportItems = config.getExportItemsDefaults();
    playlistData = await getPlaylistData(playlistId, exportItems);
  } else {
    const input = await inquirer.prompt([
      {
        type: "checkbox",
        name: "exportItems",
        message: "Which data do you want to export for each video?",
        choices: [
          { name: "Position in the playlist", value: "position" },
          { name: "Title", value: "title" },
          { name: "Uploader", value: "uploader" },
          { name: "Uploader URL", value: "uploaderUrl" },
          { name: "Description", value: "description" },
          { name: "URL", value: "url" },
        ],
        default: config.getExportItemsDefaults(),
        validate: (input) => {
          if (input.length === 0) {
            return chalk.red("Select at least 1 item to export");
          }
          return true;
        },
      },
    ]);

    const dataSpinner = ora("Fetching playlist data...").start();

    // Fetch playlist data
    try {
      playlistData = await getPlaylistData(playlistId, input.exportItems);
      dataSpinner.succeed("Fetched playlist data");
    } catch (error) {
      dataSpinner.fail("Failed in fetching playlist data");
      handleApiError(error);
    }
  }

  console.log(playlistData);
};

/**
 * Handle error from fetching YouTube API.
 * @param {Error} error
 */
function handleApiError(error) {
  const { status, reason } = JSON.parse(error.message);

  switch (reason) {
    case "playlistNotFound": // 404
      console.error(chalk.red(`ERROR (${status}): Playlist cannot be found.`));
      console.error(chalk.red("This may be because the playlist visibility is set to private."));
      break;
    default:
      console.error(
        chalk.red(`ERROR (${status} ${reason}): Something went wrong. Please try again!`)
      );
      break;
  }
}

export default idActionHandler;
