const getiTunes = require('./getiTunes.js');
const getYoutube = require('./getYoutube.js');

function getTrack(searchQuery, callback) {
  getiTunes(searchQuery, function(song) {
    song.fileName = song.artistName + ' - ' + song.trackCensoredName;
    song.path = {
      file: process.cwd() + '/' + song.fileName + '.mp3',
      image: process.cwd() + '/' + song.fileName + '.jpg'
    }

    getYoutube(song.fileName, song.trackTimeMillis, 1000, 0, 10, function(video) {
      callback(song, video);
    });
  });
}

module.exports = getTrack;
