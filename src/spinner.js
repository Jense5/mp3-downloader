// @flow

import ora from 'ora';

let spinner = ora({ text: 'Starting download...' });

export default {
  start: () => spinner.start(),
  text: (text: string) => { spinner.text = text; },
  warn: (text: string, proceed: boolean = true) => {
    const newSpinner = spinner.warn(text);
    spinner = newSpinner;
    if (proceed) {
      spinner.text = 'Proceeding...';
      spinner.start();
    }
  },
  succeed: (text: string) => {
    const newSpinner = spinner.succeed(text);
    spinner = newSpinner;
  },
  fail: (text: string) => {
    const newSpinner = spinner.fail(text);
    spinner = newSpinner;
  },
};
