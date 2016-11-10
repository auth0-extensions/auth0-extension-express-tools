const tape = require('tape');

const authenticateAdmins = require('../../src/middlewares').authenticateAdmins;

const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlzcyI6Imh0dHA6Ly9hcGkiLCJhdWQiOiJ1cm46YXBpIn0.fCWP0OpIHewitj-jMEcGuKUsU8a3lmktBUCLkCE6mCc';
const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlzcyI6Imh0dHA6Ly9hcGkifQ.9muVyU5BI4e1qXlCZidHaUiYWUNNVbgxRD4ZEvP3kUQ';

tape('authenticateAdmins should throw error if options is null', function(t) {
  try {
    authenticateAdmins();
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('authenticateAdmins should throw error if options.secret is null', function(t) {
  try {
    authenticateAdmins({
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('authenticateAdmins should throw error if options.secret is empty', function(t) {
  try {
    authenticateAdmins({
      secret: ''
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('authenticateAdmins should throw error if options.audience is null', function(t) {
  try {
    authenticateAdmins({
      secret: 'abc'
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('authenticateAdmins should throw error if options.audience is empty', function(t) {
  try {
    authenticateAdmins({
      secret: 'abc',
      audience: ''
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('authenticateAdmins should throw error if options.baseUrl is null', function(t) {
  try {
    authenticateAdmins({
      secret: 'abc',
      audience: 'urn:api'
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('authenticateAdmins should throw error if options.baseUrl is empty', function(t) {
  try {
    authenticateAdmins({
      secret: 'abc',
      audience: 'urn:api',
      baseUrl: ''
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('authenticateAdmins should return error if token is invalid', function(t) {
  const mw = authenticateAdmins({
    secret: 'abc',
    audience: 'urn:api',
    baseUrl: 'http://api'
  });
  mw({ headers: { authorization: 'Bearer xyz' } }, { }, (err) => {
    t.ok(err);
    t.equal(err.name, 'UnauthorizedError');
    t.end();
  });
});

tape('authenticateAdmins should return error if credentials are required', function(t) {
  const mw = authenticateAdmins({
    secret: 'abc',
    audience: 'urn:api',
    baseUrl: 'http://api',
    credentialsRequired: true
  });
  mw({ headers: { } }, { }, (err) => {
    t.ok(err);
    t.equal(err.name, 'UnauthorizedError');
    t.end();
  });
});

tape('authenticateAdmins should return the user if token is valid', function(t) {
  const mw = authenticateAdmins({
    secret: 'abc',
    audience: 'urn:api',
    baseUrl: 'http://api'
  });

  const req = { headers: { authorization: 'Bearer ' + validToken } };
  mw(req, { }, (err) => {
    t.notOk(err);
    t.ok(req.user);
    t.ok(req.user.sub, '1234567890');
    t.end();
  });
});

tape('authenticateAdmins should support the onLoginSuccess hook', function(t) {
  const mw = authenticateAdmins({
    onLoginSuccess: (req, res, next) => { req.user.role = 'Admin'; next(); },
    secret: 'abc',
    audience: 'urn:api',
    baseUrl: 'http://api'
  });

  const req = { headers: { authorization: 'Bearer ' + validToken } };
  mw(req, { }, (err) => {
    t.notOk(err);
    t.ok(req.user);
    t.ok(req.user.sub, '1234567890');
    t.ok(req.user.role, 'Admin');
    t.end();
  });
});

tape('authenticateAdmins optional should not run if token is missing', function(t) {
  const mw = authenticateAdmins.optional({
    secret: 'abc',
    audience: 'urn:api',
    baseUrl: 'http://api'
  });

  mw({ headers: { } }, { }, (err) => {
    t.notOk(err);
    t.end();
  });
});

tape('authenticateAdmins optional should return error if token matches issuer but audience is invalid', function(t) {
  const mw = authenticateAdmins.optional({
    secret: 'abc',
    audience: 'urn:api',
    baseUrl: 'http://api'
  });

  mw({ headers: { authorization: 'Bearer ' + invalidToken } }, { }, (err) => {
    t.ok(err);
    t.equal(err.name, 'UnauthorizedError');
    t.end();
  });
});

tape('authenticateAdmins optional should not run if token is invalid', function(t) {
  const mw = authenticateAdmins.optional({
    secret: 'abc',
    audience: 'urn:api',
    baseUrl: 'http://api'
  });

  mw({ headers: { authorization: 'Bearer foo' } }, { }, (err) => {
    t.notOk(err);
    t.end();
  });
});

tape('authenticateAdmins optional should return the user if token is valid', function(t) {
  const mw = authenticateAdmins.optional({
    onLoginSuccess: (req, res, next) => { next(); },
    secret: 'abc',
    audience: 'urn:api',
    baseUrl: 'http://api'
  });

  const req = { headers: { authorization: 'Bearer ' + validToken } };
  mw(req, { }, (err) => {
    t.notOk(err);
    t.ok(req.user);
    t.ok(req.user.sub, '1234567890');
    t.end();
  });
});
