const chalk = require("chalk");
const { program } = require("commander");

program
  .name("ytpl-export id")
  .usage("<playlistId> [options]")
  .argument(
    "<playlistId>",
    `The "list" parameter value in the URL of the playlist homepage (https://www.youtube.com/playlist?list=${chalk.greenBright(
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
  );

program.parse(process.argv);
