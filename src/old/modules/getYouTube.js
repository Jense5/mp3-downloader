const display = require('./display.js');
const messages = require('./messages.js');
const timeConverter = require('./timeConverter.js');

const YouTube = require('youtube-node');
const youTube = new YouTube();
youTube.setKey('AIzaSyCW6fU6Zn1sXqZwTGoQfcTjr5Rcd5VN4bA');

function getYoutube(searchQuery, trackTimeMillis, timeSpan, startingPoint, maxResults, callback) {
  youTube.search(searchQuery, maxResults, function(error, results) {
    if (error) {
      display.error(error, false);
    }

    if (results.items.length === 0) {
      display.error(messages.noYouTubeResults);
    }

    const resultsToScan = maxResults - startingPoint;
    var scannedResults = 0;
    var found = false;

    var i = startingPoint;
    while (i < results.items.length) {
        youTube.getById(results.items[i].id.videoId, function(error, result) {
          if (error) {
            display.error(error, false);
          }

          const video = result.items[0];

          if (!found && !!video&& video.kind === 'youtube#video') {
            video.link = 'https://www.youtube.com/watch?v=' + video.id;
            video.durationMillis = timeConverter(video.contentDetails.duration)

            video.durationDifferenceMillis = video.durationMillis - trackTimeMillis;

            if (video.durationDifferenceMillis <= timeSpan && video.durationDifferenceMillis >= -timeSpan) {
              display.message(messages.YouTubeResultsFound);
              callback(result.items[0]);
              found = true;
            }
          }

          if (scannedResults === resultsToScan - 1 && found === false) {
            if (maxResults === 10) {
              const newTimeSpan = timeSpan + 1000;

              display.warning(messages.noResultsInTimespan, true);
              display.message(messages.expandingTimespan(newTimeSpan / 1000));
              getYoutube(searchQuery, trackTimeMillis, newTimeSpan, 0, 10, callback);
            }
          }
          scannedResults++;
        });
      i++;
    }
  });
}

module.exports = getYoutube;
