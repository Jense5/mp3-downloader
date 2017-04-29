#!/usr/bin/env node
// @flow

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import winston from 'winston';
import commander from 'commander';
import Store from 'node-user-defaults';
import { toc } from 'tic-toc';
import Promise from 'bluebird';
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
.option('-b, --bulk [file]', 'Bulk file, one query per line')
.option('-f, --force [url]', 'Youtube url to use')
.option('-c, --country [country]', 'Specify which country of the iTunes store to search (alpha-2 or alpha-3 code)')
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

if (commander.bulk) {
  const location = path.resolve(process.cwd(), commander.bulk);
  if (!fs.existsSync(location)) {
    winston.error(chalk.red.bold('Bulk file does not exist!'));
    process.exit();
  }
} else if (commander.args.length < 1) {
  winston.error(chalk.red.bold('No query provided!'));
  process.exit();
}

let queries = [];

if (commander.bulk) {
  const location = path.resolve(process.cwd(), commander.bulk);
  queries = fs.readFileSync(location, 'utf8').split('\n');
} else {
  queries = [commander.args.join(' ')];
}

const options = {
  directory: commander.output || process.cwd(),
  country: commander.country,
  debug: commander.debug,
  link: commander.force,
  verbose: true,
  token,
};

const allOptions = queries.filter(q => !!q).map(query => ({ ...options, query }));

// DOWNLOAD STARTS FROM HERE. EVENTS WILL BE EMITTED.

const downloadSingleOptions = (args: Object) => new Promise((resolve) => {
  const db = args.debug;
  const vb = args.verbose;
  if (!db && vb) { spinner.start(); }

  const downloader = download(args);
  downloader.on('log', (...params) => { if (db) { winston.debug(...params); } });
  downloader.on('warning', (...params) => { if (!db && vb) { spinner.warn(...params); } });
  downloader.on('updateState', (...params) => { if (!db && vb) { spinner.text(...params); } });

  downloader.on('success', () => {
    if (db) { return winston.debug(`Completed in ${Math.round(toc() * 100) / 100}s.`); }
    if (!vb) { return undefined; }
    const time = Math.round(toc() * 100) / 100;
    spinner.succeed(`Download of ${chalk.bold(args.query)} complete in ${chalk.bold(`${time}s`)}!`);
    return resolve();
  });

  downloader.on('fail', (error) => {
    if (db) { return winston.error(`Failed with error: ${error.message}`); }
    if (vb) { return !error ? spinner.fail('An unknown error occurred.') : error.message.split('\n').map(e => spinner.fail(e)); }
    return undefined;
  });
});

Promise.map(allOptions, opt => downloadSingleOptions(opt), { concurrency: 1 });
