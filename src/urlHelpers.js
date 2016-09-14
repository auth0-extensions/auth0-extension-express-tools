const url = require('url');

const getBasePath = function(originalUrl, path) {
  var basePath = url.parse(originalUrl).pathname || '';
  basePath = basePath.replace(path, '')
    .replace(/^\/|\/$/g, '');
  if (!basePath.startsWith('/')) {
    basePath = '/' + basePath;
  }
  if (!basePath.endsWith('/')) {
    basePath += '/';
  }
  return basePath;
};

module.exports.getBasePath = function(req) {
  return getBasePath(req.originalUrl || '', req.path);
};

module.exports.getBaseUrl = function(req) {
  const originalUrl = url.parse(req.originalUrl || '').pathname || '';
  return url.format({
    protocol: process.env.NODE_ENV !== 'production' ? 'http' : 'https',
    host: req.get('host'),
    pathname: originalUrl.replace(req.path, '')
  });
};
