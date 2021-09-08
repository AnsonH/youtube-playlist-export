import chalk from "chalk";
import inquirer from "inquirer";
import Config from "../lib/Config.js";

/**
 * Action handler for `ytpl-export config`
 * @param {{ path: boolean, reset: boolean }} options   Command options
 */
const configActionHandler = async (options) => {
  const config = new Config();

  if (options.path) {
    console.log(`Path of config file: ${chalk.cyan(config.path)}`);
  }

  if (options.reset) {
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
};

export default configActionHandler;
