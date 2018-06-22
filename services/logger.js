const fs = require('fs');
const path = require('path');
const { transports, format, createLogger } = require('winston');
const makeDir = require('make-dir');
const config = require('../config/env');

const DEV_MODE = config.isDevMode();
const logPath = path.resolve(config.getLogPath());

try {
  fs.statSync(logPath);
} catch (e) {
  makeDir.sync(logPath);
}

//default app logger
const logger = createLogger({
  transports: getLoggerTransports('default-logger', 'app'),
  format: getFormat(),
});

module.exports = logger;

function getFormat() {
  const t = format.timestamp();
  const p = format.printf(
    info => `[${info.timestamp}] - ${info.level}: ${info.message}`
  );
  if (DEV_MODE) {
    return format.combine(t, format.colorize(), p);
  }
  return format.combine(t, format.json());
}

function getLoggerTransports(loggerName, fileName) {
  const logFileName = getLogFileName(fileName);
  const logErrorFileName = getLogFileName(fileName, 'error');
  const loggerTransports = [
    new transports.File({
      name: loggerName,
      filename: path.join(logPath, logFileName),
      level: 'info',
      maxsize: '5242880', //5MB
      maxFiles: 50,
      tailable: true,
    }),
    new transports.File({
      name: loggerName + '-error',
      filename: path.join(logPath, logErrorFileName),
      level: 'error',
      maxsize: '2097152', //2MB
      maxFiles: 50,
      tailable: true,
      handleExceptions: true,
      humanReadableUnhandledException: true,
    }),
  ];
  loggerTransports.push(
    new transports.Console({
      handleExceptions: true,
      humanReadableUnhandledException: true,
      level: 'info',
    })
  );
  return loggerTransports;
}

function getLogFileName(name = 'app', level = '', ext = 'log') {
  return `${name}${level ? '-' + level : ''}.${ext}`;
}
