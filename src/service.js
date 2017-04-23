// @flow

import path from 'path';
import Promise from 'bluebird';
import Youtube from 'youtube-node';
import { iTunes } from 'itunes-info';

const timeStrToMillis = (str) => {
  const units = { S: 1000, M: 1000 * 60, H: 1000 * 60 * 60, D: 1000 * 60 * 60 * 24 };
  const content = str.replace('PT', '');
  const numbers = content.split(/\D/g);
  const symbols = content.match(/\D/g);
  return numbers.reduce((a, b, i) => a + (b * units[symbols[i]]), 0);
};

const expandYoutube = (youtube, element) => new Promise((resolve, reject) => {
  youtube.getById(element.id.videoId, (error, result) => {
    if (error) { return reject(new Error(error)); }
    if (result.items.length < 1 || !result.items[0]) { return resolve(undefined); }
    const video = result.items[0];
    video.link = `https://www.youtube.com/watch?v=${video.id}`;
    video.durationMillis = timeStrToMillis(video.contentDetails.duration);
    return resolve(video);
  });
});

export const fetchFromiTunes = (options: Object) => iTunes.fetch(options.query).then((data) => {
  if (data.results.length < 1) { throw new Error('No results!'); }
  const tracks = data.results.filter(res => res.kind === 'song');
  if (tracks.length < 1) { throw new Error('No tracks!'); }
  tracks[0].artworkUrl512 = tracks[0].artworkUrl100.replace('100x100', '512x512');
  tracks[0].filename = `${tracks[0].artistName} - ${tracks[0].trackCensoredName}`;
  tracks[0].path = {
    file: path.resolve(options.directory, `${tracks[0].filename}.mp3`),
    image: path.resolve(options.directory, `${tracks[0].filename}.jpg`),
  };
  return tracks[0];
});

export const fetchFromYoutube = (options: Object) => new Promise((resolve, reject) => {
  const youtube = new Youtube();
  youtube.setKey(options.token);
  youtube.search(options.query, options.results, (error, results) => {
    if (error) { return reject(new Error(error)); }
    if (results.items.length === 0) { return reject(new Error('No YouTube results!')); }
    return Promise.map(results.items, res => expandYoutube(youtube, res), { concurrency: 50 })
    .then((videos) => {
      const list = videos.filter(v => !!v);
      list.forEach((res) => { res.timeDifference = res.durationMillis - options.duration; });
      list.sort((a, b) => a - b);
      resolve({ ...options, ...list[0] });
    });
  });
});

export const download = (options: Object) =>
  fetchFromiTunes(options)
  .then(track => fetchFromYoutube({ ...options, ...track }));
