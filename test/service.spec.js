import { expect } from 'chai';
import {
  timeStrToMillis,
  fetchFromiTunes,
} from '../src/service';


describe('fetchFromiTunes', () => {
  it('should return correct iTunes result', (done) => {
    const options = { directory: '/some/path', query: 'nirvana teen spirit' };
    fetchFromiTunes(options).then((complete) => {
      expect(complete.kind).to.equal('song');
      expect(complete.query).to.equal(options.query);
      expect(complete.artistName).to.equal('Nirvana');
      expect(complete.directory).to.equal(options.directory);
      expect(complete.trackCensoredName).to.equal('Smells Like Teen Spirit');
      expect(complete.filename).to.equal('Nirvana - Smells Like Teen Spirit');
      expect(complete.path.file).to.equal('/some/path/Nirvana - Smells Like Teen Spirit.mp3');
      expect(complete.path.image).to.equal('/some/path/Nirvana - Smells Like Teen Spirit.jpg');
      done();
    });
  });

  it('should return correct iTunes result without directory', (done) => {
    const options = { query: 'nirvana teen spirit' };
    fetchFromiTunes(options).then((complete) => {
      expect(complete.kind).to.equal('song');
      expect(complete.query).to.equal(options.query);
      expect(complete.artistName).to.equal('Nirvana');
      expect(complete.directory).to.equal(options.directory);
      expect(complete.trackCensoredName).to.equal('Smells Like Teen Spirit');
      expect(complete.filename).to.equal('Nirvana - Smells Like Teen Spirit');
      expect(complete.path.file.endsWith('Nirvana - Smells Like Teen Spirit.mp3')).to.equal(true);
      expect(complete.path.image.endsWith('Nirvana - Smells Like Teen Spirit.jpg')).to.equal(true);
      done();
    });
  });

  it('should return no iTunes result for invalaid query', (done) => {
    const options = { query: 'd19bea2af7864553ff6481141f0ad8e2' };
    fetchFromiTunes(options).then((complete) => {
      expect(complete.kind).to.equal(undefined);
      done();
    });
  });

  it('should return no iTunes result without query', (done) => {
    fetchFromiTunes({}).then((complete) => {
      expect(complete.kind).to.equal(undefined);
      done();
    });
  });
});

describe('Time Parser', () => {
  it('should parse Youtube times correctly', () => {
    const times = {
      valid: [{ str: 'PT1M30S', time: 90000 }, { str: 'PT1H10M59S', time: 4259000 }],
      invalid: [{ str: 'PT1M40S', time: 90550 }, { str: 'PT5H10M59S', time: 4259900 }],
    };
    times.valid.forEach(ti => expect(timeStrToMillis(ti.str)).to.equal(ti.time));
    times.invalid.forEach(ti => expect(timeStrToMillis(ti.str)).to.not.equal(ti.time));
  });
});
