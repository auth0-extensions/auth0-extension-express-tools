const tape = require('tape');

const urlHelpers = require('../src/urlHelpers');

tape('urlHelpers#getBasePath should return the base path of the request', function(t) {
  const req = {
    originalUrl: 'https://sandbox.it.auth0.com/api/run/mytenant/abc',
    path: '/users'
  };

  t.equal(urlHelpers.getBasePath(req), '/api/run/mytenant/abc/');
  t.end();
});

tape('urlHelpers#getBasePath should return slash if not running in webtask', function(t) {
  const req = {
    path: '/users'
  };

  t.equal(urlHelpers.getBasePath(req), '/');
  t.end();
});

tape('urlHelpers#getBaseUrl should return the base path of the request', function(t) {
  const req = {
    originalUrl: 'https://sandbox.it.auth0.com/api/run/mytenant/abc',
    path: '/users',
    get: function() {
      return 'sandbox.it.auth0.com';
    }
  };

  t.equal(urlHelpers.getBaseUrl(req), 'http://sandbox.it.auth0.com/api/run/mytenant/abc');
  t.end();
});

tape('urlHelpers#getBaseUrl should return slash if not running in webtask', function(t) {
  const req = {
    path: '/users',
    get: function() {
      return 'sandbox.it.auth0.com';
    }
  };

  t.equal(urlHelpers.getBaseUrl(req), 'http://sandbox.it.auth0.com');
  t.end();
});
