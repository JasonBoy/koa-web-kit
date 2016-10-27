var dateFormat = require('dateformat');

module.exports = {
  simpleDate () {
    return dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
  }
};

