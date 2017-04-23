const display = require('./display.js');
const messages = require('./messages.js');

const http = require('http');
const nodeID3 = require('node-id3');
const fs = require('fs');

function tagFile(song, callback) {
  display.message(messages.tagging);
  const image = fs.createWriteStream(song.path.image);
  const request = http.get(song.artworkUrl512, function(response) {
    const stream = response.pipe(image);

    stream.on('finish', function() {
      nodeID3.removeTags(song.path.file);

      const tags = {
        title: song.trackCensoredName,
        artist: song.artistName,
        album: song.collectionCensoredName,
        image: song.path.image,
        trackNumber: song.trackNumber,
        genre: song.primaryGenreName,
        date: song.releaseDate,
        year: song.releaseDate.substring(0, 4)
      }

      const success = nodeID3.write(tags, song.path.file);

      if (success) {
        fs.unlink(song.path.image, function() {
          callback();
        });
      } else {
        display.error(messages.taggingWentWRong, true);
      }
    });
  });
}

module.exports = tagFile;
