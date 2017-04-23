function error(message, color) {
  if (color) {
    message = '\x1b[31m' + message + '\x1b[0m';
  }
  console.error(message);
  process.exit();
}

function warning(message, color) {
  if (color) {
    message = '\x1b[33m' + message + '\x1b[0m';
  }
  console.warn(message);
}

function message(message) {
  console.log(message);
}

module.exports = {
  error: error,
  warning: warning,
  message: message
}
