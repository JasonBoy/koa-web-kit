const format = require('date-fns/format');
const DEFAULT_FORMAT = 'yyyy-MM-dd HH:mm:ss';

module.exports = {
  simpleDate() {
    return format(new Date(), DEFAULT_FORMAT);
  },
  now() {
    return this.simpleDate();
  },
  format(date = Date.now(), pattern = DEFAULT_FORMAT) {
    return format(date, pattern);
  },
};
