const crypto = require('crypto');

const fuckedBrands = ['huawei'];


// some hash and crypto stuff

exports.genHash = function genHash(content, algorithm) {
  const c = crypto.createHash(algorithm);
  c.update(content);
  return c.digest('hex');
};

exports.genSHA1 = function genSHA1(content) {
  return exports.genHash(content, 'sha1');
};

exports.getRandomSHA1 = function getRandomSHA1 (byteLength) {
  return crypto.randomBytes(byteLength ? byteLength : 20).toString('hex');
};


//some UA related utilities, and some simple device check

exports.normalizeUA = function normalizeUA (ua) {
  return String(ua || '').toLowerCase();
};

exports.isFuckedPhone = function isFuckedPhone (ua) {
  ua = this.normalizeUA(ua);
  for(const phone of fuckedBrands) {
    if(ua.indexOf(phone) >= 0) {
      return true;
    }
  }
  return false;
};

exports.isHuawei = function isHuawei (ua) {
  ua = this.normalizeUA(ua);
  return ua.indexOf(fuckedBrands[0]) >= 0;
};

exports.isIOS = function isIOS (ua) {
  ua = this.normalizeUA(ua);
  return ua.indexOf('iphone') >= 0 || ua.indexOf('ipad') >= 0;
};

exports.isAndroid = function isAndroid (ua) {
  ua = this.normalizeUA(ua);
  return ua.indexOf('android') >= 0;
};

exports.isMobile = function isMobile (ua) {
  return this.isIOS(ua) || this.isAndroid(ua);
};