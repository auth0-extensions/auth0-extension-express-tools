const tape = require('tape');

const webtaskConfigMiddleware = require('../../src/middlewares').webtaskConfig;

tape('webtaskConfig should not do anything if not running in webtask', function(t) {
  webtaskConfigMiddleware()({ }, { }, function(err) {
    t.notOk(err);
    t.end();
  });
});


tape('webtaskConfig should not do anything if not running in webtask', function(t) {
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
      t.ok(provider);
      t.equal(provider('a'), 'value1');
      t.end();
    }
  };

  webtaskConfigMiddleware(config)(req, { }, function() {

  });
});
