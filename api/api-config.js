/**
 * API urls configuration
 */

/**
 * api urls
 */
exports.api = {
  TEST: '/v1/login',
  TEST_2: {
    path: '/v2/logout',
    prefix: '/api-proxy-2',
  },
  TEST_3: {
    path: '/v3/logout',
    prefix: '/api-proxy-3',
  },
  TEST_4: '/v4/logout',
  TEST_5: {
    path: '/v5/login',
  },
  TEST_6: {
    path: '/v6/login',
  },
};

/**
 * Simplify the rest parameters creation, e.g:
 * //NOTICE: order of params in array is important, params use object do not care about order
 * formatRestfulUrl('/user/:id/:id2', [1,2]) ->  /user/1/2
 * formatRestfulUrl('/user/:id/:id2', {id2: 2, id: 1}) ->  /user/1/2
 * @param {string} url request url definition
 * @param {Array|Object} params rest parameters
 * @return {*}
 */
exports.formatRestfulUrl = function(url, params) {
  if (!params || url.indexOf(':') < 0) return url;
  let parts = url.split('/');
  let partIndex = 0;
  const isArray = Array.isArray(params);
  parts.forEach(function(ele, index) {
    if (ele.indexOf(':') === 0) {
      parts[index] = isArray ? params[partIndex] : params[ele.substring(1)];
      partIndex++;
    }
  });
  return parts.join('/');
};

/**
 * Check the number of rest params in the current url definition
 * @param url
 * @return {number}
 */
exports.numberOfRestParams = function(url) {
  const matched = url.match(/\/:/g);
  return matched ? matched.length : 0;
};
