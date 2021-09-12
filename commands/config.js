import chalk from "chalk";
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
    console.log(`Path of config file: ${chalk.cyan(config.path)}`);
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
          { name: "Exit", value: "exit" },
        ],
      },
    ]);

    console.log(""); // New line

    switch (input.configItem) {
      case "exportOptions":
        await editExportOptions(config);
        console.log(chalk.green("✔ Successfully saved default export options.\n"));
        break;
      case "exit":
        exit = true;
        break;
    }
  }
};

/**
 * Edit default export options.
 * @param {Config} config
 */
async function editExportOptions(config) {
  const { exportItems, fileExt, folderPath } = await inquirer.prompt(exportOptionsPrompts());

  config.setExportItemsDefaults(exportItems);
  config.fileExt = fileExt;
  config.folderPath = folderPath;
}

/**
 * Resets all configuration to default.
 * @param {Config} config
 */
async function resetConfig(config) {
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
    console.log(chalk.green("✔ Successfully reset all configurations to default."));
  }
}

export default configActionHandler;
