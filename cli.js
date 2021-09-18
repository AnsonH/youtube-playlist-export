#!/usr/bin/env node

import chalk from "chalk";
import { program } from "commander";
import { readPackage } from "read-pkg";
import updateNotifier from "update-notifier";
import idActionHandler from "./commands/id.js";
import keyActionHandler from "./commands/key.js";
import configActionHandler from "./commands/config.js";

(async () => {
  const pkg = await readPackage();

  updateNotifier({ pkg }).notify();

  program.name("ytpl-export").version(pkg.version);

  program
    .command("id")
    .description("Export data of a playlist by its ID.")
    .argument(
      "<playlistId>",
      `The value of the "list" parameter in the the playlist homepage URL (https://www.youtube.com/playlist?list=${chalk.greenBright(
        "[playlistId]"
      )})`
    )
    .option("-d, --default", "Skip all questions and use the default config")
    .addHelpText(
      "after",
      `
Example:
 $ ytpl-export id PLBCF2DAC6FFB574DE 
    `
    )
    .action(idActionHandler);

  program.command("key").description("Manage your YouTube API key.").action(keyActionHandler);

  program
    .command("config")
    .description("Edit configurations of this app.")
    .option("-p, --path", "show the path of the config file")
    .option("-r, --reset", "reset all configurations to default")
    .action(configActionHandler);

  program.parse(process.argv);
})();
