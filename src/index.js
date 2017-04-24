// @flow

import winston from 'winston';
import chalk from 'chalk';
import { tic, toc } from 'tic-toc';
import spinner from './spinner';
import { fetchFromiTunes, fetchFromYoutube, download } from './service';

export default (options: Object) => {
  tic();
  winston.debug(`Starting download with options: ${JSON.stringify(options, null, 4)}`);
  if (options.verbose && !options.debug) { spinner.start(); }
  if (options.verbose && !options.debug) { spinner.text('Fetching iTunes data...'); }
  winston.debug('Fetching iTunes data...');
  fetchFromiTunes(options)
  .then(track => fetchFromYoutube({ ...options, ...track }))
  .then(track => download(track))
  .then(() => {
    if (options.verbose && !options.debug) {
      spinner.succeed(`Download complete in ${chalk.bold(`${Math.round(toc() * 100) / 100}s`)}!`);
    } else if (options.debug) {
      winston.debug(`Completed in ${Math.round(toc() * 100) / 100}s`);
    }
  })
  .catch((error) => {
    if (options.verbose && !options.debug) {
      spinner.fail(error.message);
    } else if (options.debug) {
      winston.error(`Failed with error: ${error.message}`);
    }
  });
};
