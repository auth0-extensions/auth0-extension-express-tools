const tape = require('tape');

const certs = require('../mocks/certs');
const tokens = require('../mocks/tokens');
const authenticateUsers = require('../../src/middlewares').authenticateUsers;

tape('authenticateUsers should throw error if options is null', function(t) {
  try {
    authenticateUsers();
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('authenticateUsers should throw error if domain is null', function(t) {
  try {
    authenticateUsers({ });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});


tape('authenticateUsers should throw error if domain is empty', function(t) {
  try {
    authenticateUsers({ domain: '' });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('authenticateUsers should throw error if audience is null', function(t) {
  try {
    authenticateUsers({ domain: 'me.auth0.com' });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('authenticateUsers should throw error if audience is empty', function(t) {
  try {
    authenticateUsers({ domain: 'me.auth0.com', audience: '' });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('authenticateUsers should return error if token is invalid', function(t) {
  const mw = authenticateUsers({
    domain: 'me.auth0.com',
    audience: 'urn:myapp'
  });
  mw({ headers: { authorization: 'Bearer xyz' } }, { }, (err) => {
    t.ok(err);
    t.equal(err.name, 'UnauthorizedError');
    t.end();
  });
});

tape('authenticateUsers should return error if credentials are required', function(t) {
  const mw = authenticateUsers({
    domain: 'me.auth0.com',
    audience: 'urn:myapp',
    credentialsRequired: true
  });
  mw({ }, { }, (err) => {
    t.ok(err);
    t.equal(err.name, 'UnauthorizedError');
    t.end();
  });
});

tape('authenticateUsers should return the user if token is valid', function(t) {
  const mw = authenticateUsers({
    domain: 'me.auth0.com',
    audience: 'urn:myapp'
  });

  tokens.wellKnownEndpoint('me.auth0.com', certs.bar.cert, 'key2');
  const token = tokens.sign(certs.bar.private, 'key2', {
    iss: 'https://me.auth0.com/',
    sub: 'bar',
    aud: 'urn:myapp'
  });

  const req = { headers: { authorization: 'Bearer ' + token } };
  mw(req, { }, (err) => {
    t.notOk(err);
    t.ok(req.user);
    t.ok(req.user.sub, 'bar');
    t.end();
  });
});

tape('authenticateUsers should support the onLoginSuccess hook', function(t) {
  const mw = authenticateUsers({
    domain: 'me.auth0.com',
    audience: 'urn:myapp',
    onLoginSuccess: (req, res, next) => { req.user.role = 'Admin'; next(); }
  });

  tokens.wellKnownEndpoint('me.auth0.com', certs.bar.cert, 'key2');
  const token = tokens.sign(certs.bar.private, 'key2', {
    iss: 'https://me.auth0.com/',
    sub: 'bar',
    aud: 'urn:myapp'
  });

  const req = { headers: { authorization: 'Bearer ' + token } };
  mw(req, { }, (err) => {
    t.notOk(err);
    t.ok(req.user);
    t.ok(req.user.sub, 'bar');
    t.ok(req.user.role, 'Admin');
    t.end();
  });
});

tape('authenticateUsers optional should not run if token is missing', function(t) {
  const mw = authenticateUsers.optional({
    domain: 'me.auth0.com',
    audience: 'urn:myapp'
  });

  mw({ headers: { } }, { }, (err) => {
    t.notOk(err);
    t.end();
  });
});

tape('authenticateUsers optional should return error if token matches issuer but audience is invalid', function(t) {
  const mw = authenticateUsers.optional({
    domain: 'me.auth0.com',
    audience: 'urn:myapp'
  });

  tokens.wellKnownEndpoint('me.auth0.com', certs.bar.cert, 'key2');
  const token = tokens.sign(certs.bar.private, 'key2', {
    iss: 'https://me.auth0.com/',
    sub: 'bar',
    aud: 'urn:my-other-app'
  });

  mw({ headers: { authorization: 'Bearer ' + token } }, { }, (err) => {
    t.ok(err);
    t.equal(err.name, 'UnauthorizedError');
    t.end();
  });
});

tape('authenticateUsers optional should not run if token is invalid', function(t) {
  const mw = authenticateUsers.optional({
    domain: 'me.auth0.com',
    audience: 'urn:myapp'
  });

  mw({ headers: { authorization: 'Bearer foo' } }, { }, (err) => {
    t.notOk(err);
    t.end();
  });
});

tape('authenticateUsers optional should return the user if token is valid', function(t) {
  const mw = authenticateUsers.optional({
    domain: 'me.auth0.com',
    audience: 'urn:myapp'
  });

  tokens.wellKnownEndpoint('me.auth0.com', certs.bar.cert, 'key2');
  const token = tokens.sign(certs.bar.private, 'key2', {
    iss: 'https://me.auth0.com/',
    sub: 'bar',
    aud: 'urn:myapp'
  });

  const req = { headers: { authorization: 'Bearer ' + token } };
  mw(req, { }, (err) => {
    t.notOk(err);
    t.ok(req.user);
    t.ok(req.user.sub, 'bar');
    t.end();
  });
});
