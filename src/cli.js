#!/usr/bin/env node
// @flow

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import winston from 'winston';
import commander from 'commander';

import math from './index';

const pkg = path.resolve(__dirname, '../package.json');
const conf = JSON.parse(fs.readFileSync(pkg, 'utf8'));

commander
.version(conf.version)
.usage('<options>')
.option('-s, --sample', 'Add sample')
.option('-n, --number [number]', 'Sample number', parseInt)
.parse(process.argv);

const number = commander.number || 3;

winston.info(`${chalk.green('Hello world!')}`);
if (commander.sample) { winston.info(`${chalk.blue('Sample: ')} true`); }
winston.info(`${chalk.green('Result:')} ${math.add(1, number)}`);
