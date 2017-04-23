// @flow

import chalk from 'chalk';
import winston from 'winston';
import spinner from './spinner';
import { tic, toc, last, history } from 'tic-toc';
import { fetchFromiTunes, fetchFromYoutube, download } from './service';

export default (options) => {
  if (options.verbose) {
    tic();
    spinner.start();
  }
  fetchFromiTunes(options)
  .then(track => fetchFromYoutube({ ...options, ...track }))
  .then(track => download(track))
  .then(() => {
    //toc
    if (options.verbose) {
      spinner.succeed(`Download complete in ${chalk.bold(`${Math.round(toc() * 100) / 100}s`)}!`);
    }
  })
  .catch((error) => {
    if (options.verbose) {
      spinner.fail(error.message);
    }
  });
};
