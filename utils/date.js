const moment = require('moment');
const defaultFormat = 'YYYY-MM-DD HH:mm:ss';

module.exports = {
  simpleDate () {
    return moment().format(defaultFormat);
  },
  now () {
    return this.simpleDate();
  },
  format (date = Date.now(), pattern = defaultFormat) {
    return moment(date).format(pattern);
  },
};

