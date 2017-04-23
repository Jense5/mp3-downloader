
<h1 align="center">Music Downloader</h1>

<p align="center">
![version](https://img.shields.io/npm/v/mp3-downloader.svg)
![downloads](https://img.shields.io/npm/dt/mp3-downloader.svg)
</p>

Command line tool to download mp3 files with metadata! All information, including album arts, are fetched from iTunes. Youtube is used to download the music. The correct result from Youtube is matched on the first result of iTunes based on the time in milliseconds. Make sure to get your free Youtube Data API token from the Google Developer Console.

<h4 align="center">QuickStart</h4>

```sh
# Install it on your system.
$ npm install mp3-downloader -g

# You will need a Youtube token to start because this tool uses
# the API instead of a scraper. This way it shouldn't be updated
# whenever the site changes. You can get your free Youtube Data
# API token via the google developer console
# https://console.developers.google.com
$ mp3 --token "XYZ" --save-token

# From now on, download music as much as you want. If no output
# location is provided, your current working directory will be used.
$ mp3 "Byte Martin Garrix" --output "~/Desktop"

# You can override the token if you have to.
$ mp3 "Byte Martin Garrix" --token "ABC"

# It's also possible to limit the number of results to check when
# connecting to the Youtube API.
$ mp3 "Byte Martin Garrix" --results 25

# For more info, check the help.
$ mp3 --help
```
<br />
<p align="center">
  <a href="https://js.org" target="_blank" title="JS.ORG | JavaScript Community">
  <img src="https://logo.js.org/dark_horz.png" width="102" alt="JS.ORG Logo"/></a>
</p>
