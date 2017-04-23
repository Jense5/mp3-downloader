// @flow

import { fetchFromiTunes, fetchFromYoutube, download } from './service';

const options = {
  results: 25,
  query: 'hey brother avicii',
  directory: '/Users/bernard/Desktop',
  token: 'AIzaSyCW6fU6Zn1sXqZwTGoQfcTjr5Rcd5VN4bA',
};

fetchFromiTunes(options)
.then(track => fetchFromYoutube({ ...options, ...track }))
.then(track => download(track));
