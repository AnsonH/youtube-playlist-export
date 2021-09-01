#!/usr/bin/env node

const { program } = require("commander");
const packageJson = require("../package.json");

program.version(packageJson.version).parse(process.argv);
