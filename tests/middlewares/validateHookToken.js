const { expect } = require('chai');

const tools = require('auth0-extension-tools');
const validateHookTokenMiddleware = require('../../src/middlewares').validateHookToken;

describe('validateHookToken', function() {
  it('should validate the domain', function() {
    expect(() => {
      validateHookTokenMiddleware();
    }).to.throw();

    expect(() => {
      validateHookTokenMiddleware(1);
    }).to.throw();
  });

  it('should validate the webtaskUrl', function() {
    expect(() => {
      validateHookTokenMiddleware('me.auth0.com');
    }).to.throw();

    expect(() => {
      validateHookTokenMiddleware('me.auth0.com', 1);
    }).to.throw();
  });

  it('should validate the extensionSecret', function() {
    expect(() => {
      validateHookTokenMiddleware('me.auth0.com', 'http://foo.com');
    }).to.throw();

    expect(() => {
      validateHookTokenMiddleware('me.auth0.com', 'http://foo.com', 1);
    }).to.throw();
  });

  it('should validate the hookPath', function() {
    expect(() => {
      const mw1 = validateHookTokenMiddleware('me.auth0.com', 'http://foo.com', 'abc');
      mw1();
    }).to.throw();

    expect(() => {
      const mw2 = validateHookTokenMiddleware('me.auth0.com', 'http://foo.com', 'abc');
      mw2(123);
    }).to.throw();
  });

  it('should throw error is authorization header is missing', function(done) {
    const validator = validateHookTokenMiddleware('me.auth0.com', 'http://foo.com', 'abc');
    const req = {
      headers: {

      }
    };

    validator('/extension')(req, { }, function(err) {
      expect(err).to.exist;
      expect(err).to.be.instanceOf(tools.HookTokenError);
      done();
    });
  });

  it('should throw error is token is missing', function(done) {
    const validator = validateHookTokenMiddleware('me.auth0.com', 'http://foo.com', 'abc');
    const req = {
      headers: {
        authorization: 'Bearer '
      }
    };

    validator('/extension')(req, { }, function(err) {
      expect(err).to.exist;
      expect(err).to.be.instanceOf(tools.HookTokenError);
      done();
    });
  });

  it('validate the token', function(done) {
    const validator = validateHookTokenMiddleware('me.auth0.com', 'https://webtask.io/run/abc', 'mysecret');
    const req = {
      headers: {
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL21lLmF1dGgwLmNvbSIsImF1ZCI6Imh0dHBzOi8vd2VidGFzay5pby9ydW4vYWJjL2V4dGVuc2lvbi91bmluc3RhbGwifQ.fdAaM7cLdirmv4KyQ46Vq4eat04gRb7KWi8kpQAhA-Q'
      }
    };

    validator('/extension/uninstall')(req, { }, function(err) {
      expect(err).to.not.exist;
      done();
    });
  });
});
