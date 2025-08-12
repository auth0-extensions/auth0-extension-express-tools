const { expect } = require('chai');

const requireAuthentication = require('../../src/middlewares').requireAuthentication;

describe('requireAuthentication', function() {
  it('should continue if user is set', function(done) {
    requireAuthentication(
      { user: { name: 'foo' } },
      { },
      function(err) {
        expect(err).to.not.exist;
        done();
      }
    );
  });

  it('should return error if user is not set', function(done) {
    requireAuthentication(
      { },
      { },
      function(err) {
        expect(err).to.exist;
        expect(err.name).to.equal('UnauthorizedError');
        done();
      }
    );
  });
});
