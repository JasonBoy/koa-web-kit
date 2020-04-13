const crypto = require('crypto');

// some hash and crypto stuff

exports.genHash = function genHash(content, algorithm) {
  const c = crypto.createHash(algorithm);
  c.update(content);
  return c.digest('hex');
};

exports.genSHA1 = function genSHA1(content) {
  return exports.genHash(content, 'sha1');
};

exports.genMD5 = function genSHA1(content) {
  return exports.genHash(content, 'md5');
};

exports.getRandomSHA1 = function getRandomSHA1(byteLength) {
  return crypto.randomBytes(byteLength ? byteLength : 20).toString('hex');
};

exports.toBase64 = function(input) {
  return Buffer.from(input).toString('base64');
};
