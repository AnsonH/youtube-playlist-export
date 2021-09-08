import chalk from "chalk";
import inquirer from "inquirer";
import { validateApiKey } from "../lib/api.js";
import Config from "../lib/Config.js";

async function setApiKey() {
  const config = new Config();

  const input = await inquirer.prompt([
    {
      type: "input",
      name: "apiKey",
      message: "Enter your YouTube API key: ",
      validate: validateApiKey,
    },
  ]);

  config.apiKey = input.apiKey.trim();
  console.log(chalk.green("✔ Successfully set the API key."));
}

/**
 * Action handler for `ytpl-export key`
 */
const keyActionHandler = async () => {
  const config = new Config();

  if (config.apiKey) {
    console.log(`Your current YouTube API key is: ${chalk.yellow(config.apiKey)}`);

    const input = await inquirer.prompt([
      {
        type: "list",
        name: "keyAction",
        message: "How would you like to manage your YouTube API key?",
        choices: [
          { name: "Edit key", value: "editKey" },
          { name: "Remove key", value: "removeKey" },
          { name: "Exit", value: "exit" },
        ],
      },
    ]);

    switch (input.keyAction) {
      case "editKey":
        setApiKey();
        break;
      case "removeKey":
        config.removeApiKey();
        console.log(chalk.green("✔ Successfully removed the API key."));
        break;
      default:
        break;
    }
  } else {
    console.log("You haven't entered your YouTube API key!");
    console.log(
      `Watch this 3 min. tutorial on how to get a YouTube API key (v3) - ${chalk.cyan.underline(
        "https://youtu.be/N18czV5tj5o"
      )}`
    );
    setApiKey();
  }
};

export default keyActionHandler;
