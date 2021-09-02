#!/usr/bin/env node

const { program } = require("commander");
const packageJson = require("../package.json");

program
  .version(packageJson.version)
  .command("id", "Export a playlist by its ID")
  .command("key", "Manage your YouTube API key interactively")
  .command("config", "Manage preferences of the app interactively")
  .parse(process.argv);
