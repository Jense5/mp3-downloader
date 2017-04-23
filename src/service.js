// @flow

import Youtube from 'youtube-node';
import { iTunes } from 'itunes-info';

const fetchFromiTunes = options => iTunes.fetch(options.query).then((data) => {
  if (data.results.length < 1) { throw new Error('No results!'); }
  const tracks = data.results.filter(res => res.kind === 'song');
  if (tracks.length < 1) { throw new Error('No tracks!'); }
  tracks[0].artworkUrl512 = tracks[0].artworkUrl100.replace('100x100', '512x512');
  return tracks[0];
});

const fetchFromYoutube = options => new Promise((resolve, reject) => {

});
