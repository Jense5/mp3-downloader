// @flow

import chalk from 'chalk';
import { tic, toc } from 'tic-toc';
import spinner from './spinner';
import { fetchFromiTunes, fetchFromYoutube, download } from './service';

export default (options: Object) => {
  tic();
  if (options.verbose) { spinner.start(); }
  fetchFromiTunes(options)
  .then(track => fetchFromYoutube({ ...options, ...track }))
  .then(track => download(track))
  .then(() => {
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
