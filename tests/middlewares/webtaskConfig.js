const { expect } = require('chai');

const webtaskConfigMiddleware = require('../../src/middlewares').webtaskConfig;

describe('webtaskConfig', function() {
  it('should not do anything if not running in webtask', function(done) {
    webtaskConfigMiddleware()({ }, { }, function(err) {
      expect(err).to.not.exist;
      done();
    });
  });

  it('should not do anything if not running in webtask', function(done) {
    const req = {
      webtaskContext: {
        params: {
          a: 'value1',
          b: 'value2',
          Setting: 456
        },
        secrets: {
          user: 'usr',
          password: 'pwd',
          Setting: 789
        }
      }
    };

    const config = {
      setProvider(provider) {
        expect(provider).to.exist;
        expect(provider('a')).to.equal('value1');
        done();
      }
    };

    webtaskConfigMiddleware(config)(req, { }, function() {

    });
  });
});
