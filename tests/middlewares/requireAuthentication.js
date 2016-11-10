const tape = require('tape');

const requireAuthentication = require('../../src/middlewares').requireAuthentication;

tape('requireUser should continue if user is set', function(t) {
  requireAuthentication(
    { user: { name: 'foo' } },
    { },
    function(err) {
      t.notOk(err);
      t.end();
    }
  );
});

tape('requireUser should return error if user is not set', function(t) {
  requireAuthentication(
    { },
    { },
    function(err) {
      t.ok(err);
      t.equal(err.name, 'UnauthorizedError');
      t.end();
    }
  );
});
