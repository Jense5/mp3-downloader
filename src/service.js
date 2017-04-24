// @flow

import fs from 'fs';
import http from 'http';
import path from 'path';
import winston from 'winston';
import nodeID3 from 'node-id3';
import Promise from 'bluebird';
import untildify from 'untildify';
import Youtube from 'youtube-node';
import { iTunes } from 'itunes-info';
import YoutubeDL from 'youtube-dl-status';
import spinner from './spinner';

const timeStrToMillis = (str) => {
  const units = { S: 1000, M: 1000 * 60, H: 1000 * 60 * 60, D: 1000 * 60 * 60 * 24 };
  const content = str.replace('PT', '');
  const numbers = content.split(/\D/g).filter(e => !!e);
  const symbols = content.match(/\D/g).filter(e => !!e);
  return numbers.reduce((a, b, i) => a + (b * units[symbols[i]]), 0);
};

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

export const fetchFromiTunes = (options: Object) => iTunes.fetch(options.query).then((data) => {
  if (options.verbose && !options.debug) { spinner.text('Fetched iTunes data...'); }
  winston.debug('Fetched iTunes data...');
  winston.debug(`Received a total of ${data.results.length} results.`);
  if (data.results.length > 0) {
    const tracks = data.results.filter(res => res.kind === 'song');
    if (tracks.length < 1) { throw new Error('No tracks!'); }
    tracks[0].artworkUrl512 = tracks[0].artworkUrl100.replace('100x100', '512x512');
    tracks[0].filename = `${tracks[0].artistName} - ${tracks[0].trackCensoredName}`;
    tracks[0].path = {
      file: path.resolve(untildify(options.directory), `${tracks[0].filename}.mp3`),
      image: path.resolve(untildify(options.directory), `${tracks[0].filename}.jpg`),
    };
    tracks[0].isiTunesResult = true;
    winston.debug(`Will take this track to proceed: ${JSON.stringify(tracks[0], null, 4)}`);
    return tracks[0];
  }
  if (options.verbose && !options.debug) {
    spinner.warn('Couldn\'t find this track on iTunes.');
    spinner.warn('The download will start, but without the metadata.');
  }
  winston.debug('No results, will proceed without tagging...');
  return { isiTunesResult: false };
});

export const fetchFromYoutube = (options: Object) => new Promise((resolve, reject) => {
  if (options.verbose && !options.debug) { spinner.text('Finding Youtube match...'); }
  winston.debug('Finding a Youtube match...');
  const youtube = new Youtube();
  youtube.setKey(options.token);
  const query = options.isiTunesResult ? options.filename : options.query;
  youtube.search(query, options.results, (error, results) => {
    if (error) { return reject(new Error('Bad Youtube request, make sure you have a valid token!')); }
    winston.debug(`Found a total of ${results.items.length} tracks on Youtube.`);
    if (results.items.length === 0) { return reject(new Error('No YouTube results!')); }
    return Promise.map(results.items, res => expandYoutube(youtube, res), { concurrency: 50 })
    .then((videos) => {
      const list = videos.filter(v => !!v);
      if (!options.isiTunesResult) { return resolve({ ...options, ...list[0] }); }
      list.forEach((res) => {
        res.timeDifference = Math.abs(res.durationMillis - options.trackTimeMillis);
      });
      list.sort((a, b) => a.timeDifference - b.timeDifference);
      return resolve({ ...options, ...list[0] });
    });
  });
});

export const setMetadata = (options: Object) => new Promise((resolve, reject) => {
  if (options.verbose && !options.debug) { spinner.text('Writing metadata...'); }
  winston.debug('Writing metadata...');
  if (!options.isiTunesResult) { return resolve('Finished without metadata.'); }
  return http.get(options.artworkUrl512, (response) => {
    if (response.statusCode === 200) {
      response.pipe(fs.createWriteStream(options.path.image)).on('finish', () => {
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
        return fs.unlink(options.path.image, resolve);
      });
    } else { reject(new Error('Unable to fetch metadata!')); }
  });
});

export const download = (options: Object) => new Promise((resolve, reject) => {
  if (options.verbose && !options.debug) { spinner.text('Starting download...'); }
  winston.debug('Starting download...');
  const filename = options.isiTunesResult ? options.filename : options.query;
  const conf = [
    '--extract-audio',
    '--audio-quality=0',
    '--format=bestaudio',
    '--audio-format=mp3',
    `--output=${path.resolve(untildify(options.directory), `${filename}.%(ext)s`)}`,
  ];
  const downloadProcess = YoutubeDL.exec(options.link, conf, () => {
    setMetadata(options).then(resolve).catch(reject);
  });
  downloadProcess.stdout.on('data', (data) => {
    const re = /[0-9]+((\.[0-9]{1}){0,1})%/i;
    const matches = data.match(re);
    if (matches && matches.length && matches.length > 0) {
      const percentage = matches[0];
      const text = percentage !== '100%' ? `Downloading track... ${percentage}` : 'Converting...';
      if (options.verbose && !options.debug) { spinner.text(text); }
      winston.debug(text);
    }
  });
});
