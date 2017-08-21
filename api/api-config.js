/**
 * API urls configuration
 */


exports.api = {
  TEST: '/prefix/login',
};

exports.formatRestfulUrl = function(url, params) {
  if(!params || url.indexOf(':') < 0) return url;
  let parts = url.split('/');
  let partIndex = 0;
  const isArray = Array.isArray(params);
  parts.forEach(function (ele, index) {
    if(ele.indexOf(':') === 0) {
      parts[index] = isArray ? params[partIndex] : params[ele.substring(1)];
      partIndex++;
    }
  });
  return parts.join('/');
};

const restRegex = /\/:/g;
exports.numberOfRestParams = function (url) {
  const matched = url.match(restRegex);
  return matched ? matched.length : 0;
};