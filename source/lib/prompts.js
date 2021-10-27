import c from "chalk";
import isAbsolute from "is-absolute";
import Config from "./Config.js";
import * as prompts from "./prompts.js";

export const validateExportItems = (input) => {
  if (input.length === 0) {
    return c.red("Select at least 1 item to export");
  }
  return true;
};

export const validateFilePath = (input) =>
  isAbsolute(input) ? true : c.red("Please enter a valid absolute path!");

/**
 * Prompt questions for exporting playlist data. Used in `ytpl-export id <playlistId>` command
 * @returns Array of `inquirer` question objects
 */
export const exportOptionsPrompts = () => {
  const config = new Config();

  return [
    {
      type: "checkbox",
      name: "exportItems",
      message: "Which data do you want to export for each video?",
      choices: [
        { name: "1. Position in the playlist", value: "position" },
        { name: "2. Title", value: "title" },
        { name: "3. Uploader", value: "uploader" },
        { name: "4. Uploader URL", value: "uploaderUrl" },
        { name: "5. URL", value: "url" },
        { name: "6. Description", value: "description" },
        { name: "7. Video privacy", value: "videoPrivacy" },
        { name: "8. Publish time (UTC)", value: "publishTime" },
      ],
      default: config.getExportItemsDefaults(),
      validate: prompts.validateExportItems,
    },
    {
      type: "list",
      name: "fileExt",
      message: "Which file extension do you prefer?",
      choices: [
        { name: "JSON", value: "json" },
        { name: "CSV", value: "csv" },
      ],
      default: config.get("fileExt"),
    },
    {
      type: "input",
      name: "folderPath",
      // prettier-ignore
      message: `Input an ${c.underline("absolute")} path of a ${c.underline("folder")} where the data will be saved to:`,
      default: config.get("folderPath"),
      validate: prompts.validateFilePath,
    },
  ];
};
