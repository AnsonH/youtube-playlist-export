#!/usr/bin/env node

const chalk = require("chalk");
const { program } = require("commander");
const idActionHandler = require("./commands/id");
const keyActionHandler = require("./commands/key");
const configActionHandler = require("./commands/config");
const packageJson = require("./package.json");

program.name("ytpl-export").version(packageJson.version);

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

program.command("config").description("Manage preferences of this app.").action(configActionHandler);

program.parse(process.argv);
