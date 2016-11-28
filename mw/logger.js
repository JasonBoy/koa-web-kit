const fs = require('fs');
const winston = require('winston');
// const winstonDaily = require('winston-daily-rotate-file');
const dateUtil = require('../utils/date');


try {
  fs.statSync('./logs');
} catch(e) {
  fs.mkdirSync('./logs');
}

//default app logger
const loggerDate = () => {
  return ['[', dateUtil.simpleDate() , ']'].join('');
};

const myLogger = new (winston.Logger)({
  transports: getLoggerTransports('default-logger', 'app')
});

module.exports = myLogger;

function getLoggerTransports(name, filename) {
  const loggerTransports = [
    new (winston.transports.File)({
      name: name,
      filename: `./logs/${filename}.log`,
      level: 'info',
      maxsize: '5242880', //5MB
      maxFiles: 50,
      tailable: true,
      timestamp: loggerDate
    }),
    new (winston.transports.File)({
      name: name + '-error',
      filename: `./logs/${filename}-err.log`,
      level: 'error',
      maxsize: '2097152', //2MB
      maxFiles: 50,
      tailable: true,
      timestamp: loggerDate,
      handleExceptions: true,
      humanReadableUnhandledException: true
    })
  ];
  loggerTransports.push(new (winston.transports.Console)({
    colorize: true,
    timestamp: loggerDate,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    level: 'debug'
  }));
  return loggerTransports;
}

