#!/usr/bin/env node
// @flow

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import winston from 'winston';
import commander from 'commander';
import Store from 'node-user-defaults';

import download from './index';

Store.setLocation('~/.node-music-downloader');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, { showLevel: false });

const pkg = path.resolve(__dirname, '../package.json');
const conf = JSON.parse(fs.readFileSync(pkg, 'utf8'));

commander
.version(conf.version)
.usage('<options> query')
.option('-d, --debug', 'Enable debug mode')
.option('-o, --output [output]', 'Output directory')
.option('-t, --token [token]', 'Youtube authentication token')
.option('-r, --results [results]', 'Max results to check', parseInt)
.option('-s, --save-token', 'Store the Youtube authentication token for future use')
.parse(process.argv);

if (commander.debug) { winston.level = 'debug'; }

const token = commander.token || Store.read('token');
if (commander.saveToken) { Store.write('token', token); }
if (!token) {
  winston.error(chalk.red.bold('No token provided!'));
  process.exit();
}

if (commander.args.length < 1) {
  winston.error(chalk.red.bold('No query provided!'));
  process.exit();
}

download({
  results: commander.results || 25,
  query: commander.args.join(' '),
  directory: commander.output || process.cwd(),
  debug: commander.debug,
  verbose: true,
  token, // 'AIzaSyCW6fU6Zn1sXqZwTGoQfcTjr5Rcd5VN4bA',
});
