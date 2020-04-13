const slugify = require('slugify');

slugify.extend({ '/': '-' });

//Some weired phone brands with weired browser features support
const fuckedBrands = [];

//some UA related utilities, and some simple device check

exports.normalizeUA = function normalizeUA(ua) {
  return String(ua || '').toLowerCase();
};

exports.isFuckedPhone = function isFuckedPhone(ua) {
  ua = this.normalizeUA(ua);
  for (const phone of fuckedBrands) {
    if (ua.indexOf(phone) >= 0) {
      return true;
    }
  }
  return false;
};

exports.isIOS = function isIOS(ua) {
  ua = this.normalizeUA(ua);
  return ua.indexOf('iphone') >= 0 || ua.indexOf('ipad') >= 0;
};

exports.isAndroid = function isAndroid(ua) {
  ua = this.normalizeUA(ua);
  return ua.indexOf('android') >= 0;
};

exports.isMobile = function isMobile(ua) {
  return this.isIOS(ua) || this.isAndroid(ua);
};

exports.slugify = function(input) {
  return slugify(input);
};

exports.wait = function(ms = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};
