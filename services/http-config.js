exports.HTTP_METHOD = {
  GET: 'GET',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
  PATCH: 'PATCH',
  POST: 'POST',
  PUT: 'PUT',
  TRACE: 'TRACE',
};

//Some common used http headers
exports.HEADER = {
  CONTENT_TYPE: 'content-type',
};

//Some common used body content type
exports.BODY_TYPE = {
  JSON: 'application/json',
  FORM_URL_ENCODED: 'application/x-www-form-urlencoded',
};

exports.getResponseContentType = function(response) {
  if (!response || !response.headers) return;
  const headers = response.headers;
  if (typeof headers.get === 'function') {
    return headers.get(exports.HEADER.CONTENT_TYPE);
  }
  return headers[exports.HEADER.CONTENT_TYPE];
};

exports.isJSONResponse = function(response) {
  const type = exports.getResponseContentType(response);
  if (!type) return false;
  return type.indexOf(exports.BODY_TYPE.JSON) >= 0;
};
