#!/usr/bin/env node
// @flow

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import winston from 'winston';
import commander from 'commander';
import Store from 'node-user-defaults';
import { toc } from 'tic-toc';
import spinner from './spinner';

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

// PROCESS ALL THE OPTIONS

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

const options = {
  directory: commander.output || process.cwd(),
  results: commander.results || 25,
  query: commander.args.join(' '),
  debug: commander.debug,
  verbose: true,
  token,
};

// DOWNLOAD STARTS FROM HERE. EVENTS WILL BE EMITTED.

const db = options.debug;
const vb = options.verbose;
if (!db && vb) { spinner.start(); }

const downloader = download(options);
downloader.on('log', (...params) => { if (db) { winston.debug(...params); } });
downloader.on('warning', (...params) => { if (!db && vb) { spinner.warn(...params); } });
downloader.on('updateState', (...params) => { if (!db && vb) { spinner.text(...params); } });

downloader.on('success', () => {
  if (db) { return winston.debug(`Completed in ${Math.round(toc() * 100) / 100}s.`); }
  if (!vb) { return undefined; }
  const time = Math.round(toc() * 100) / 100;
  return spinner.succeed(`Download complete in ${chalk.bold(`${time}s`)}!`);
});

downloader.on('fail', (error) => {
  if (db) { return winston.error(`Failed with error: ${error.message}`); }
  if (vb) { return spinner.fail(error.message); }
  return undefined;
});
