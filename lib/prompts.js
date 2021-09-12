import chalk from "chalk";
import { validateFolderPath } from "../utils/saveFile.js";
import Config from "./Config.js";

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
      validate(input) {
        if (input.length === 0) {
          return chalk.red("Select at least 1 item to export");
        }
        return true;
      },
    },
    {
      type: "list",
      name: "fileExt",
      message: "Which file extension do you prefer?",
      choices: [
        { name: "JSON", value: "json" },
        { name: "CSV", value: "csv" },
      ],
      default: 0,
    },
    {
      type: "input",
      name: "folderPath",
      // prettier-ignore
      message: `Input an ${chalk.underline("absolute")} path of a ${chalk.underline("folder")} where the data will be saved to:`,
      default: config.folderPath,
      validate: validateFolderPath,
    },
  ];
};
