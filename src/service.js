// @flow

import Youtube from 'youtube-node';
import { iTunes } from 'itunes-info';

const fetchFromiTunes = options => new Promise((resolve, reject) => {

});

const fetchFromYoutube = options => new Promise((resolve, reject) => {
  const youTube = new YouTube();
  youTube.setKey(options.token);

  youTube.search(options.query, options.results, function(error, results) {
    if (error) { return reject(new Error(error)); }

    const res = results.items;

    if (res.length === 0) { return reject(new Error('No YouTube results!')) }

    
  });
});
