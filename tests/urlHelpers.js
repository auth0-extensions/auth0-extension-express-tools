const tape = require('tape');

const urlHelpers = require('../src/urlHelpers');

tape('urlHelpers#getBasePath should return the base path of the request', function(t) {
  const req = {
    originalUrl: 'https://sandbox.it.auth0.com/api/run/mytenant/abc',
    path: '/users',
    headers: {
      host: 'sandbox.it.auth0.com'
    }
  };

  t.equal(urlHelpers.getBasePath(req), '/api/run/mytenant/abc/');
  t.end();
});

tape('urlHelpers#getBasePath should not overwrite tenant name with path', function(t) {
  const req = {
    originalUrl: 'https://sandbox.it.auth0.com/api/run/logintest/abc',
    path: '/login',
    headers: {
      host: 'sandbox.it.auth0.com'
    }
  };

  t.equal(urlHelpers.getBasePath(req), '/api/run/logintest/abc/');
  t.end();
});

tape('urlHelpers#getBasePath should return slash if not running in webtask', function(t) {
  const req = {
    path: '/users',
    headers: {
      host: 'sandbox.it.auth0.com'
    }
  };

  t.equal(urlHelpers.getBasePath(req), '/');
  t.end();
});

tape('urlHelpers#getBaseUrl should return the base path of the request', function(t) {
  const req = {
    originalUrl: 'https://sandbox.it.auth0.com/api/run/mytenant/abc',
    path: '/users',
    headers: {
      host: 'sandbox.it.auth0.com'
    },
    get: function() {
      return 'sandbox.it.auth0.com';
    }
  };

  t.equal(urlHelpers.getBaseUrl(req), 'https://sandbox.it.auth0.com/api/run/mytenant/abc');
  t.end();
});

tape('urlHelpers#getBaseUrl should return slash if not running in webtask', function(t) {
  const req = {
    path: '/users',
    headers: {
      host: 'sandbox.it.auth0.com'
    },
    get: function() {
      return 'sandbox.it.auth0.com';
    }
  };

  t.equal(urlHelpers.getBaseUrl(req), 'https://sandbox.it.auth0.com');
  t.end();
});

tape('urlHelpers#getBaseUrl should use https by default', function(t) {
  const req = {
    originalUrl: 'http://sandbox.it.auth0.com/api/run/mytenant/abc',
    path: '/users',
    headers: {
      host: 'sandbox.it.auth0.com'
    },
    get: function() {
      return 'sandbox.it.auth0.com';
    }
  };

  t.equal(urlHelpers.getBaseUrl(req), 'https://sandbox.it.auth0.com/api/run/mytenant/abc');
  t.end();
});

tape('urlHelpers#getBaseUrl should not overwrite tenant name with path', function(t) {
  const req = {
    originalUrl: 'https://sandbox.it.auth0.com/api/run/logintest/abc',
    path: '/login',
    headers: {
      host: 'sandbox.it.auth0.com'
    },
    get: function() {
      return 'sandbox.it.auth0.com';
    }
  };

  t.equal(urlHelpers.getBaseUrl(req, 'http'), 'http://sandbox.it.auth0.com/api/run/logintest/abc');
  t.end();
});
