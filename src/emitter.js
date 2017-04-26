// @flow

import EventEmitter from 'events';

export default class DownloadEmitter extends EventEmitter {

  updateState(...params: Array<any>) {
    this.emit('updateState', ...params);
    this.emit('log', ...params);
  }
  warning(...params: Array<any>) {
    this.emit('warning', ...params);
    this.emit('log', ...params);
  }
  success(...params: Array<any>) {
    this.emit('success', ...params);
    this.emit('log', ...params);
  }
  fail(...params: Array<any>) {
    this.emit('fail', ...params);
    this.emit('log', ...params);
  }
  log(...params: Array<any>) { this.emit('log', ...params); }

}
