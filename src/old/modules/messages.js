const messages = {
  noQuery: 'No searchquery given!',
  noiTunesResults: 'No results found on iTunes!',
  iTunesResultsFound: 'Result found on iTunes.',
  noYouTubeResults: 'No results found on YouTube!',
  YouTubeResultsFound: 'Result found on YouTube.',
  noResultsInTimespan: 'No results found on YouTube in the current timespan!',
  expandingTimespan: (x) =>  'Expanding timespan to ' + x + 's.',
  expaindingResults: (x) => 'Expanding to ' + x + ' results.',
  downloadingFrom: (x) => 'Downloading from ' + x,
  downloadingTo: (x) => 'To: ' + x + '...',
   tagging: 'Tagging file.',
  taggingWentWrong: 'Something wen wrong while tagging the file!',
  done: (x) => 'Done in ' + x + 's.'
}

module.exports = messages;
