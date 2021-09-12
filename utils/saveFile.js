import chalk from "chalk";
import fs from "fs";
import isAbsolute from "is-absolute";
import { Parser } from "json2csv";
import path from "path";

/**
 * Save playlist data into a file.
 * @param {object[]} playlistData
 * @param {{ fileExt: "csv"|"json", folderPath: string, playlistTitle: string }} options
 */
export function saveFile(playlistData, options) {
  const { fileExt, folderPath, playlistTitle } = options;

  let output;
  switch (fileExt) {
    case "csv":
      output = new Parser().parse(playlistData);
      break;
    case "json":
    default:
      output = JSON.stringify(playlistData, null, 2);
  }

  // Create download folder if not exist
  if (!fs.existsSync(folderPath)) {
    try {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`${chalk.green("✔")} Created new folder: ${chalk.cyan(folderPath)}`);
    } catch (error) {
      console.error(chalk.red(`✖ Error in creating new folder in ${folderPath}`));
      console.error(error);
      return;
    }
  }

  // Save file
  const filePath = path.join(folderPath, getFileName(playlistTitle, fileExt));

  try {
    fs.writeFileSync(filePath, output);
  } catch (error) {
    console.error(chalk.red(`✖ Error in saving file to ${filePath}`));
    console.error(error);
    return;
  }

  console.log(`${chalk.green("✔ Successfully exported to: " + filePath)}`);
}

/**
 * Generate a properly formatted file name.
 * @param {string} playlistTitle
 * @param {"csv"|"json"} fileExt
 * @returns {string} Example: `2021-09-20-Google-Search-Stories.csv`
 */
function getFileName(playlistTitle, fileExt) {
  const currentDate = new Date().toISOString().substring(0, 10); // YYYY-MM-DD

  let title = playlistTitle.replace(/[<>:"/\\|?*]/g, ""); // Remove illegal characters in file name
  title = title.replace(/ /g, "-"); // Replace empty space with `-`

  return `${currentDate}-${title}.${fileExt}`;
}

/**
 * Validates the output folder path.
 * @param {string} input
 */
export function validateFolderPath(input) {
  if (isAbsolute(input)) {
    return true;
  }

  return chalk.red("Please enter a valid absolute path!");
}
