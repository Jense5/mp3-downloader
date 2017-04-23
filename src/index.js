// @flow

import spinner from './spinner';
import { fetchFromiTunes, fetchFromYoutube, download } from './service';

export default (options) => {
  if (options.spinner) { spinner.start(); }
  fetchFromiTunes(options)
  .then(track => fetchFromYoutube({ ...options, ...track }))
  .then(track => download(track))
  .then(() => {
    if (options.spinner) { spinner.succeed('Download complete!'); }
  })
  .catch((error) => {
    if (options.spinner) { spinner.fail(error.message); }
  });
};
