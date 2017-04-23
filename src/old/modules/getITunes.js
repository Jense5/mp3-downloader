const display = require('./display.js');
const messages = require('./messages.js');

const iTunes = require('itunes-info').iTunes;

function getiTunes(searchQuery, callback) {
  iTunes.fetch(searchQuery)
  .then((data) => {
    if (data.results.length === 0) {
      display.error(messages.noiTunesResults, true);
    } else {
      display.message(messages.iTunesResultsFound)
      var i = 0;
      while (i < data.results.length) {
        if (data.results[i].kind === 'song') {
          data.results[i].artworkUrl512 = data.results[i].artworkUrl100.replace('100x100', '512x512')
          callback(data.results[i]);
          i = data.results.length;
        } else {
          i++;
        }
      }
    }
  }).catch((error) => {
    display.error(error, false);
  });
}

module.exports = getiTunes;
