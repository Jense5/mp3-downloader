// @flow

import { tic } from 'tic-toc';
import { fetchFromiTunes, fetchFromYoutube, download, setMetadata } from './service';
import Emitter from './emitter';

export default (options: Object) => {
  tic();
  const emitter = new Emitter();
  fetchFromiTunes({ ...options, emitter })
  .then(fetchFromYoutube)
  .then(download)
  .then(setMetadata)
  .catch(error => emitter.fail(error));
  return emitter;
};
