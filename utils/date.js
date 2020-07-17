const moment = require('moment');
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_TIME_FORMAT_NO_SPACE = 'YYYYMMDDHHmmss';

function simpleDate() {
  return moment().format(DATE_TIME_FORMAT);
}

module.exports = {
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  DATE_TIME_FORMAT_NO_SPACE,
  simpleDate,
  now() {
    return simpleDate();
  },
  format(date = Date.now(), pattern = DATE_TIME_FORMAT) {
    return moment(date).format(date, pattern);
  },
};
