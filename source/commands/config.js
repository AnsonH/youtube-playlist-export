import c from "chalk";
import inquirer from "inquirer";
import Config from "../lib/Config.js";
import { exportOptionsPrompts } from "../lib/prompts.js";

/**
 * Action handler for `ytpl-export config`
 * @param {{ path: boolean, reset: boolean }} options   Command options
 */
const configActionHandler = async (options) => {
  const config = new Config();

  if (options.path) {
    console.log(`Path of config file: ${c.cyan(config.path)}`);
    return;
  }

  if (options.reset) {
    resetConfig(config);
    return;
  }

  let exit = false;
  while (!exit) {
    const input = await inquirer.prompt([
      {
        type: "list",
        name: "configItem",
        message: 'Which config do you want to edit? Choose "Exit" if you\'re done.',
        choices: [
          {
            name: "Default export options (eg. Items to export, save location)",
            value: "exportOptions",
          },
          { name: "Skipping private or deleted videos", value: "skipPrivateOrDeleted" },
          { name: "Update notification", value: "notifyUpdate" },
          { name: "Exit", value: "exit" },
        ],
      },
    ]);
    console.log("");

    switch (input.configItem) {
      case "exportOptions":
        await editExportOptions();
        console.log(c.green("✔ Saved default export options.\n"));
        break;
      case "notifyUpdate":
        await editNotifyUpdate();
        console.log(c.green("✔ Saved update notification preference.\n"));
        break;
      case "skipPrivateOrDeleted":
        await editSkipPrivateOrDeleted();
        console.log(c.green("✔ Saved skipping private or deleted videos.\n"));
        break;
      case "exit":
        exit = true;
        break;
    }
  }
};

async function editExportOptions() {
  const config = new Config();

  const { exportItems, fileExt, folderPath } = await inquirer.prompt(exportOptionsPrompts());

  config.setExportItemsDefaults(exportItems);
  config.set("fileExt", fileExt);
  config.set("folderPath", folderPath);
}

async function editNotifyUpdate() {
  const config = new Config();

  const { notifyUpdate } = await inquirer.prompt([
    {
      type: "list",
      name: "notifyUpdate",
      message: "Enable notification for new updates to the app?",
      choices: [
        { name: "Enable", value: true },
        { name: "Disable", value: false },
      ],
      default: config.get("notifyUpdate"),
    },
  ]);

  config.set("notifyUpdate", notifyUpdate);
}

async function editSkipPrivateOrDeleted() {
  const config = new Config();

  const { skipPrivateOrDeleted } = await inquirer.prompt([
    {
      type: "list",
      name: "skipPrivateOrDeleted",
      message:
        "Do you want to skip/ignore any private or deleted videos in the playlist?" +
        "\nChoosing 'Skip' will NOT create an entry in the exported JSON/CSV file if the video is private/deleted.",
      choices: [
        { name: "Skip", value: true },
        { name: "Do not skip", value: false },
      ],
      default: config.get("skipPrivateOrDeleted"),
    },
  ]);

  config.set("skipPrivateOrDeleted", skipPrivateOrDeleted);
}

async function resetConfig() {
  const config = new Config();

  const input = await inquirer.prompt([
    {
      type: "confirm",
      name: "resetConfig",
      message: "Are you sure to reset all configurations to default?",
      default: false,
    },
  ]);

  if (input.resetConfig) {
    config.resetAll();
    console.log(c.green("✔ Successfully reset all configurations to default."));
  }
}

export default configActionHandler;
