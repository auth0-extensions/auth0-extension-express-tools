const tape = require('tape');

const tools = require('auth0-extension-tools');
const validateHookTokenMiddleware = require('../../src/middlewares').validateHookToken;

tape('validateHookToken should validate the domain', function(t) {
  try {
    validateHookTokenMiddleware();
  } catch (e) {
    t.ok(e);
    t.ok(e instanceof tools.ArgumentError);
  }

  try {
    validateHookTokenMiddleware(1);
  } catch (e) {
    t.ok(e);
    t.ok(e instanceof tools.ArgumentError);
    t.end();
  }
});

tape('validateHookToken should validate the webtaskUrl', function(t) {
  try {
    validateHookTokenMiddleware('me.auth0.com');
  } catch (e) {
    t.ok(e);
    t.ok(e instanceof tools.ArgumentError);
  }

  try {
    validateHookTokenMiddleware('me.auth0.com', 1);
  } catch (e) {
    t.ok(e);
    t.ok(e instanceof tools.ArgumentError);
    t.end();
  }
});

tape('validateHookToken should validate the extensionSecret', function(t) {
  try {
    validateHookTokenMiddleware('me.auth0.com', 'http://foo.com');
  } catch (e) {
    t.ok(e);
    t.ok(e instanceof tools.ArgumentError);
  }

  try {
    validateHookTokenMiddleware('me.auth0.com', 'http://foo.com', 1);
  } catch (e) {
    t.ok(e);
    t.ok(e instanceof tools.ArgumentError);
    t.end();
  }
});

tape('validateHookToken should validate the hookPath', function(t) {
  try {
    const mw1 = validateHookTokenMiddleware('me.auth0.com', 'http://foo.com', 'abc');
    mw1();
  } catch (e) {
    t.ok(e);
    t.ok(e instanceof tools.ArgumentError);
  }

  try {
    const mw2 = validateHookTokenMiddleware('me.auth0.com', 'http://foo.com', 'abc');
    mw2(123);
  } catch (e) {
    t.ok(e);
    t.ok(e instanceof tools.ArgumentError);
    t.end();
  }
});

tape('validateHookToken should throw error is authorization header is missing', function(t) {
  const validator = validateHookTokenMiddleware('me.auth0.com', 'http://foo.com', 'abc');
  const req = {
    headers: {

    }
  };

  validator('/extension')(req, { }, function(err) {
    t.ok(err);
    t.ok(err instanceof tools.HookTokenError);
    t.end();
  });
});

tape('validateHookToken should throw error is token is missing', function(t) {
  const validator = validateHookTokenMiddleware('me.auth0.com', 'http://foo.com', 'abc');
  const req = {
    headers: {
      authorization: 'Bearer '
    }
  };

  validator('/extension')(req, { }, function(err) {
    t.ok(err);
    t.ok(err instanceof tools.HookTokenError);
    t.end();
  });
});

tape('validateHookToken validate the token', function(t) {
  const validator = validateHookTokenMiddleware('me.auth0.com', 'https://webtask.io/run/abc', 'mysecret');
  const req = {
    headers: {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL21lLmF1dGgwLmNvbSIsImF1ZCI6Imh0dHBzOi8vd2VidGFzay5pby9ydW4vYWJjL2V4dGVuc2lvbi91bmluc3RhbGwifQ.fdAaM7cLdirmv4KyQ46Vq4eat04gRb7KWi8kpQAhA-Q'
    }
  };

  validator('/extension/uninstall')(req, { }, function(err) {
    t.notOk(err);
    t.end();
  });
});
