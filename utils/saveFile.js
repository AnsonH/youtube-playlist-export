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
function saveFile(playlistData, options) {
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
 * @param {string} fileName
 * @param {string} fileExt
 * @param {boolean} addDate   If `true`, append today's date (YYYY-MM-DD) at the beginning
 * @example
 * const fileName = getFileName("Hello: World", "json", true);
 * console.log(fileName); // "2021-09-16-Hello_World.json"
 */
function getFileName(fileName, fileExt, addDate = true) {
  let name = fileName.replace(/[<>:"/\\|?*]/g, ""); // Remove illegal characters in file name
  name = name.replace(/ /g, "_"); // Replace empty space with `_`

  if (addDate) {
    const currentDate = new Date().toISOString().substring(0, 10);
    return `${currentDate}-${name}.${fileExt}`;
  } else {
    return `${name}.${fileExt}`;
  }
}

/**
 * Validates the output folder path.
 * @param {string} input
 */
function validateFolderPath(input) {
  if (isAbsolute(input)) {
    return true;
  }

  return chalk.red("Please enter a valid absolute path!");
}

export { saveFile as default, validateFolderPath };