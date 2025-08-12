const { expect } = require('chai');

const urlHelpers = require('../src/urlHelpers');

describe('urlHelpers', function() {
  describe('#getBasePath', function() {
    it('should return the base path of the request', function() {
      const req = {
        originalUrl: 'https://sandbox.it.auth0.com/api/run/mytenant/abc',
        path: '/users',
        headers: {
          host: 'sandbox.it.auth0.com'
        }
      };

      expect(urlHelpers.getBasePath(req)).to.equal('/api/run/mytenant/abc/');
    });

    it('should not overwrite tenant name with path', function() {
      const req = {
        originalUrl: 'https://sandbox.it.auth0.com/api/run/logintest/abc',
        path: '/login',
        headers: {
          host: 'sandbox.it.auth0.com'
        }
      };

      expect(urlHelpers.getBasePath(req)).to.equal('/api/run/logintest/abc/');
    });

    it('should return slash if not running in webtask', function() {
      const req = {
        path: '/users',
        headers: {
          host: 'sandbox.it.auth0.com'
        }
      };

      expect(urlHelpers.getBasePath(req)).to.equal('/');
    });
  });

  describe('#getBaseUrl', function() {
    it('should return the base path of the request', function() {
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

      expect(urlHelpers.getBaseUrl(req)).to.equal('https://sandbox.it.auth0.com/api/run/mytenant/abc');
    });

    it('should return slash if not running in webtask', function() {
      const req = {
        path: '/users',
        headers: {
          host: 'sandbox.it.auth0.com'
        },
        get: function() {
          return 'sandbox.it.auth0.com';
        }
      };

      expect(urlHelpers.getBaseUrl(req)).to.equal('https://sandbox.it.auth0.com');
    });

    it('should use https by default', function() {
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

      expect(urlHelpers.getBaseUrl(req)).to.equal('https://sandbox.it.auth0.com/api/run/mytenant/abc');
    });

    it('should not overwrite tenant name with path', function() {
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

      expect(urlHelpers.getBaseUrl(req, 'http')).to.equal('http://sandbox.it.auth0.com/api/run/logintest/abc');
    });
  });
});
