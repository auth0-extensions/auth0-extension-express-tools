const tape = require('tape');

const requireUser = require('../../src/middlewares').requireUser;

tape('requireUser should continue if user is set', function(t) {
  requireUser(
    { user: { name: 'foo' } },
    { },
    function(err) {
      t.notOk(err);
      t.end();
    }
  );
});

tape('requireUser should return error if user is not set', function(t) {
  requireUser(
    { },
    { },
    function(err) {
      t.ok(err);
      t.equal(err.name, 'UnauthorizedError');
      t.end();
    }
  );
});
