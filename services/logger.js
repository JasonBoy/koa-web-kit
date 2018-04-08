const fs = require('fs');
const path = require('path');
const winston = require('winston');
const config = require('../config/env');
const dateUtil = require('../utils/date');

const logPath = path.resolve(config.getLogPath());

try {
  fs.statSync(logPath);
} catch (e) {
  fs.mkdirSync(logPath);
}

//default app logger
const loggerDate = () => {
  return ['[', dateUtil.simpleDate(), ']'].join('');
};

const myLogger = new winston.Logger({
  transports: getLoggerTransports('default-logger', 'app'),
});

module.exports = myLogger;

function getLoggerTransports(name, filename) {
  const logFileName = `${filename}.log`;
  const logErrorFileName = `${filename}-err.log`;
  const loggerTransports = [
    new winston.transports.File({
      name: name,
      filename: path.join(logPath, logFileName),
      level: 'info',
      maxsize: '5242880', //5MB
      maxFiles: 50,
      tailable: true,
      timestamp: loggerDate,
    }),
    new winston.transports.File({
      name: name + '-error',
      filename: path.join(logPath, logErrorFileName),
      level: 'error',
      maxsize: '2097152', //2MB
      maxFiles: 50,
      tailable: true,
      timestamp: loggerDate,
      handleExceptions: true,
      humanReadableUnhandledException: true,
    }),
  ];
  loggerTransports.push(
    new winston.transports.Console({
      colorize: true,
      timestamp: loggerDate,
      handleExceptions: true,
      humanReadableUnhandledException: true,
      level: 'debug',
    })
  );
  return loggerTransports;
}
