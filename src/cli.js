#!/usr/bin/env node
// @flow

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import winston from 'winston';
import commander from 'commander';

import download from './index';

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, { showLevel: false });

const pkg = path.resolve(__dirname, '../package.json');
const conf = JSON.parse(fs.readFileSync(pkg, 'utf8'));

commander
.version(conf.version)
.usage('<options> query')
.option('-o, --output [output]', 'Output directory')
.option('-t, --token [token]', 'Youtube authentication token')
.option('-r, --results [results]', 'Max results to check', parseInt)
.parse(process.argv);

if (commander.args.length < 1) {
  winston.error(chalk.red.bold('No query provided!'));
  process.exit();
}

if (!commander.token) {
  winston.error(chalk.red.bold('No token provided!'));
  process.exit();
}

download({
  results: commander.results || 25,
  query: commander.args.join(' '),
  directory: commander.output || process.cwd(),
  token: commander.token, // 'AIzaSyCW6fU6Zn1sXqZwTGoQfcTjr5Rcd5VN4bA',
  verbose: true,
});
