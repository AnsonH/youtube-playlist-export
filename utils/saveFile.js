import c from "chalk";
import fs from "fs";
import { Parser } from "json2csv";
import path from "path";
import * as sf from "./saveFile.js";

/**
 * Save playlist data into a file.
 * @param {object[]} playlistData
 * @param {{ fileExt: "csv"|"json", folderPath: string, playlistTitle: string }} options
 * @return {boolean} Whether the operation is successful.
 */
function saveFile(playlistData, options) {
  const { fileExt, folderPath, playlistTitle } = options;

  if (!sf.createFolder(folderPath)) {
    return false;
  }

  let output;
  switch (fileExt) {
    case "csv":
      output = new Parser().parse(playlistData);
      break;
    case "json":
    default:
      output = JSON.stringify(playlistData, null, 2);
  }

  // Save file
  const filePath = path.join(folderPath, sf.getExportName(playlistTitle, fileExt));
  try {
    fs.writeFileSync(filePath, output);
  } catch (error) {
    console.error(c.red(`✖ Error in saving file to ${filePath}`));
    console.error(c.red(error.message));
    return false;
  }

  console.log(`${c.green("✔ Successfully exported to: " + filePath)}`);
  return true;
}

/**
 * Creates a folder if it does not exist.
 * @param {string} path Folder path
 * @returns {boolean} Whether the operation is successful.
 */
function createFolder(path) {
  if (fs.existsSync(path)) {
    return true;
  } else {
    try {
      fs.mkdirSync(path, { recursive: true });

      console.log(`${c.green("✔")} Created new folder: ${c.cyan(path)}`);
      return true;
    } catch (error) {
      console.error(c.red(`✖ Error in creating new folder in ${path}\n${error.message}`));
      return false;
    }
  }
}

/**
 * Gets the exported playlist's file/folder name.
 * @param {string} fileName
 * @param {string} fileExt
 * @example
 * const fileName = getFileName("Hello: World", "json");
 * console.log(fileName); // "2021-09-16-Hello_World.json"
 */
function getExportName(fileName, fileExt = null) {
  const name = formatName(fileName);
  const currentDate = new Date().toISOString().substring(0, 10); // YYYY-MM-DD

  let output = `${currentDate}-${name}`;
  if (fileExt) {
    output += `.${fileExt}`;
  }
  return output;
}

/**
 * Formats a file/folder name.
 * @param {string} fileName Name of file/folder
 * @returns {string} Formatted name
 */
function formatName(name) {
  let output = name.replace(/[<>:"/\\|?*]/g, ""); // Remove illegal characters
  return output.replace(/ /g, "_"); // Replace empty space with `_`
}

export { saveFile as default, createFolder, getExportName, formatName };
