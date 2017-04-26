// @flow

import fs from 'fs';
import http from 'http';
import path from 'path';
import chalk from 'chalk';
import nodeID3 from 'node-id3';
import Promise from 'bluebird';
import untildify from 'untildify';
import Youtube from 'youtube-node';
import { iTunes } from 'itunes-info';
import YoutubeDL from 'youtube-dl-status';
import Emitter from './emitter';

/**
 * Converts a time string, provided by Youtube, to the total amount of millis.
 * For example - PT1M20S => 80000.
 * @param {string} str The string provided by Youtube.
 * @returns {number} The total amount of millis.
 */
export const timeStrToMillis = (str: string) => {
  const units = { S: 1000, M: 1000 * 60, H: 1000 * 60 * 60, D: 1000 * 60 * 60 * 24 };
  const content = str.replace('PT', '') || '';
  const numbers = content.split(/\D/g).filter(e => !!e);
  const rawSymbols = content.match(/\D/g) || [];
  const symbols = rawSymbols.filter(e => !!e);
  const result = numbers.reduce((a, b, i) => a + (parseInt(b, 10) * units[symbols[i]]), 0);
  return result;
};

/**
 * Returns a promise which fetches the details of the given Youtube result with the given
 * Youtube instance. The api should already be set.
 * @param {Object} youtube The Youtube instance.
 * @param {Object} element The Youtube result.
 * @returns {Promise<Object>} The details of the Youtube result.
 */
const expandYoutube = (youtube, element) => new Promise((resolve, reject) => {
  youtube.getById(element.id.videoId, (error, result) => {
    if (error) { return reject(error); }
    if (result.items.length < 1 || !result.items[0]) { return resolve(undefined); }
    const video = result.items[0];
    video.link = `https://www.youtube.com/watch?v=${video.id}`;
    video.durationMillis = timeStrToMillis(video.contentDetails.duration);
    return resolve(video);
  });
});

/**
 * Fetch the data from iTunes for the given query. The query should be provided
 * as a 'query' option. An optional emitter can be provided too. The path of the
 * track will be set to the directory as provided as 'directory'. Everything
 * is optional!
 * @param {?string} options.query The query to send to the iTunes store.
 * @param {?Emitter} options.emitter Optional EventEmitter.
 * @param {?string} options.directory The directory of the track to download to.
 * @return {Promise<Object>} Promise with track details, merged with the options!
 */
export const fetchFromiTunes = (options: Object) => {
  const emitter = options.emitter || new Emitter();
  emitter.updateState('Connecting to iTunes...');
  return iTunes.fetch(options.query || '').then((data) => {
    emitter.updateState('Fetched iTunes data...');
    emitter.log(`Received a total of ${data.results.length} results.`);
    const tracks = data.results.filter(res => res.kind === 'song');
    if (tracks.length < 1) {
      emitter.warning('Could not find this track on iTunes, will not set the id3 tags.');
      return options;
    }
    emitter.log(`${tracks.length} of them are songs.`);
    tracks[0].artworkUrl512 = tracks[0].artworkUrl100.replace('100x100', '512x512');
    tracks[0].filename = `${tracks[0].artistName} - ${tracks[0].trackCensoredName}`;
    tracks[0].path = {
      file: path.resolve(untildify(options.directory || process.cwd()), `${tracks[0].filename}.mp3`),
      image: path.resolve(untildify(options.directory || process.cwd()), `${tracks[0].filename}.jpg`),
    };
    emitter.log(`Will take this track to proceed:\n${chalk.cyan(JSON.stringify(tracks[0], null, 4))}`);
    return { ...options, ...tracks[0] };
  });
};

/**
 * Fetch the data from Youtube with given filename or query. Filename will be used if
 * found, as this means that it matches an iTunes result (result of fetchFromiTunes).
 * If this one is not provided, the query option will be used.
 * @param {?string} options.filename The filename to query for on Youtube (from iTunes).
 * @param {?string} options.query The query to search for (if no filename provided).
 * @param {?string} options.token The token for the Youtube API.
 * @param {?Emitter} options.emitter Optional EventEmitter.
 * @param {?number} options.results The total amount of results to check (otherwise 50).
 * @param {?number} options.trackTimeMillis The millis of the track from iTunes (to match).
 * @return {Promise<Object>} Promise with video details, merged with the options!
 */
export const fetchFromYoutube = (options: Object) => new Promise((resolve, reject) => {
  if (options.link) { return resolve(options); }
  const emitter = options.emitter || new Emitter();
  emitter.updateState('Finding a Youtube match...');
  emitter.log(`Using "${options.token || ''}" as token for Youtube.`);
  const youtube = new Youtube();
  youtube.setKey(options.token);
  const query = options.filename || options.query || '';
  emitter.log(`Using Youtube query: ${query}`);
  return youtube.search(query, options.results || 50, (error, results) => {
    if (error) { return reject(new Error('Bad Youtube request, do you use a valid token?')); }
    emitter.log(`Found a total of ${results.items.length} tracks on Youtube.`);
    if (results.items.length === 0) { return reject(new Error('No YouTube results found!')); }
    return Promise.map(results.items, res => expandYoutube(youtube, res), { concurrency: 50 })
    .then((videos) => {
      const list = videos.filter(v => !!v);
      emitter.log(`Found a total of ${list.length} valid videos on Youtube.`);
      if (list.length === 0) {
        if (options.filename) {
          return reject(new Error(`The first result of iTunes is ${options.filename}.\nHowever, there are no youtube results for this title.\nIf this was not your desired result, please provide a more specific query.`));
        }
      }
      if (!options.filename) {
        emitter.log(`Will use this Youtube result:\n${chalk.cyan(JSON.stringify(list[0], null, 4))}`);
        return resolve({ ...options, ...list[0] });
      }
      list.forEach((res) => {
        res.timeDifference = Math.abs(res.durationMillis - (options.trackTimeMillis || 0));
      });
      list.sort((a, b) => a.timeDifference - b.timeDifference);
      emitter.log(`Will use this Youtube result:\n${chalk.cyan(JSON.stringify(list[0], null, 4))}`);
      return resolve({ ...options, ...list[0] });
    });
  });
});

/**
 * Downloads the track from youtube with the provided options.
 * @param {string} options.link The directory of the track to download to.
 * @param {?Emitter} options.emitter Optional emitter to get updates.
 * @param {?string} options.filename The filename to download to (from iTunes).
 * @param {?string} options.query The query (as backup for filename in case of no iTunes result).
 * @param {?string} options.directory The directory of the track to download to.
 * @return {Promise<Object>} Promise when download is ready.
 */
export const download = (options: Object) => new Promise((resolve) => {
  if (!options.link) { throw new Error('FATAL: Lost Youtube link!'); }
  const emitter = options.emitter || new Emitter();
  emitter.updateState('Starting download...');
  const filename = options.filename || options.query || 'track';
  const conf = [
    '--extract-audio',
    '--audio-quality=0',
    '--format=bestaudio',
    '--audio-format=mp3',
    `--output=${path.resolve(untildify(options.directory) || process.cwd(), `${filename}.%(ext)s`)}`,
  ];
  const downloadProcess = YoutubeDL.exec(options.link, conf, () => { resolve(options); });
  downloadProcess.stdout.on('data', (data) => {
    const re = /[0-9]+((\.[0-9]{1}){0,1})%/i;
    const matches = data.match(re);
    if (matches && matches.length && matches.length > 0) {
      emitter.updateState(matches[0] !== '100%' ? `Downloading track - ${matches[0]}` : 'Converting...');
    }
  });
});

/**
 * Will write the tags to the provided mp3 file. Requires all options from iTunes result!
 * @param {?Emitter} options.emitter Optional emitter to get updates.
 */
export const setMetadata = (options: Object) => new Promise((resolve, reject) => {
  const emitter = options.emitter || new Emitter();
  emitter.updateState('Writing metadata...');
  if (!options.filename) { emitter.success('Finished without metadata.'); return resolve(); }
  emitter.updateState('Fetching artwork...');
  return http.get(options.artworkUrl512, (response) => {
    if (response.statusCode === 200) {
      emitter.updateState('Received artwork.');
      response.pipe(fs.createWriteStream(options.path.image)).on('finish', () => {
        emitter.updateState('Writing tags...');
        nodeID3.removeTags(options.path.file);
        const success = nodeID3.write({
          title: options.trackCensoredName,
          artist: options.artistName,
          album: options.collectionCensoredName,
          image: options.path.image,
          trackNumber: options.trackNumber,
          genre: options.primaryGenreName,
          date: options.releaseDate,
          year: options.releaseDate.substring(0, 4),
        }, options.path.file);
        if (!success) { return reject(new Error('Unable to write metadata!')); }
        emitter.success('Finished writing metadata!');
        return fs.unlink(options.path.image, resolve);
      });
    } else { emitter.success('Issue fetching image, finished without metadata.'); resolve(); }
  });
});
