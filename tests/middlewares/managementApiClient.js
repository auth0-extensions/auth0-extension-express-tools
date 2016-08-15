const tape = require('tape');

const managementApiClientMiddleware = require('../../src/middlewares/managementApiClient');

tape('managementApiClient should attach client to the request', function(t) {
  const options = {
    domain: 'me.auth0.com',
    accessToken: 'ey'
  };

  const mw = managementApiClientMiddleware(options);
  t.ok(mw);

  const req = { };
  mw(req, { }, function() {
    t.ok(req);
    t.ok(req.auth0);
    t.ok(req.auth0.users);
    t.ok(req.auth0.users.getAll);
    t.end();
  });
});
