const units = {
  S: 1000,
  M: 1000 * 60,
  H: 1000 * 60 * 60,
  D: 1000 * 60 * 60 * 24
};

function converter(string) {
  string = string.replace('PT', '');
  const numbers = string.split(/\D/g);
  const symbols = string.match(/\D/g);
  var milliseconds = 0;

  var i = 0;
  while (i < symbols.length) {
    milliseconds += numbers[i] * units[symbols[i]];
    i++;
  }

  return milliseconds;
}

module.exports = converter;
