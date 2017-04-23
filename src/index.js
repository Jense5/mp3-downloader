// @flow

import spinner from './spinner';
import { fetchFromiTunes, fetchFromYoutube, download } from './service';

const options = {
  results: 25,
  query: 'byte martin garrix',
  directory: '/Users/bernard/Desktop',
  token: 'AIzaSyCW6fU6Zn1sXqZwTGoQfcTjr5Rcd5VN4bA',
};

spinner.start();
fetchFromiTunes(options)
.then(track => fetchFromYoutube({ ...options, ...track }))
.then(track => download(track))
.then(() => {
  spinner.succeed('Download complete!');
})
.catch((error) => {
  spinner.fail(error.message);
});
