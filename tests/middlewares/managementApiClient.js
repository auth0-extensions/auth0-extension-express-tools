const { expect } = require('chai');

const managementApiClientMiddleware = require('../../src/middlewares').managementApiClient;

describe('managementApiClient', function() {
  it('should attach client to the request', function(done) {
    const options = {
      domain: 'me.auth0.com',
      accessToken: 'ey'
    };

    const mw = managementApiClientMiddleware(options);
    expect(mw).to.be.ok;

    const req = { };
    mw(req, { }, function() {
      expect(req).to.be.ok;
      expect(req.auth0).to.be.ok;
      expect(req.auth0.users).to.be.ok;
      expect(req.auth0.users.getAll).to.be.ok;
      done();
    });
  });

  it('errors should bubble up in the middleware', function(done) {
    const options = {
      domain: 'me.auth0.com',
      clientId: 'foo',
      clientSecret: 'bar'
    };

    const mw = managementApiClientMiddleware(options);
    expect(mw).to.be.ok;

    const req = { };
    mw(req, { }, function(err) {
      expect(err).to.be.ok;
      expect(req.auth0).to.not.be.ok;
      done();
    });
  });

  it('should attach client to the request with headers', function(done) {
    const options = {
      domain: 'me.auth0.com',
      accessToken: 'ey',
      headers: { customHeader: 'custom' }
    };

    const mw = managementApiClientMiddleware(options);
    expect(mw).to.be.ok;

    const req = { };
    mw(req, { }, function() {
      expect(req).to.be.ok;
      expect(req.auth0).to.be.ok;
      const keys = Object.keys(req.auth0);
      keys.forEach(key => req.auth0[key].resource && expect(req.auth0[key].resource.restClient.options.headers.customHeader).to.equal('custom'));
      done();
    });
  });
});
