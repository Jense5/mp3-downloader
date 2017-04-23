#!/usr/bin/env node
const ticToc = require('tic-toc');

const display = require('./modules/display.js');
const messages = require('./modules/messages.js');

const getTrack = require('./modules/getTrack.js');
const tag = require('./modules/tag.js');

const youtubedl = require('youtube-dl');

if (process.argv[2] === undefined) {
  display.error(messages.noQuery, true);
}

const searchQuery = process.argv[2];

ticToc.tic();

getTrack(searchQuery, function(song, video) {
  display.message(messages.downloadingFrom(video.link));
  display.message(messages.downloadingTo(song.path.file));

  const youtubedlSettings = [
    '--format', 'bestaudio',
    '--extract-audio',
    '--audio-quality', '0',
    '--audio-format', 'mp3',
    '--output', song.fileName + '.%(ext)s'
  ];

  const videoStream = youtubedl.exec(video.link, youtubedlSettings, function(error) {
    if (error) {
      console.error(error);
      process.exit();
    }

    tag(song, function() {
      const time = Math.round(ticToc.toc() * 100) / 100
      display.message(messages.done(time));
    });
  });
});
