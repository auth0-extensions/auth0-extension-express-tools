const tape = require('tape');

const dashboardAdmins = require('../../src/routes').dashboardAdmins;
const certs = require('../mocks/certs');
const tokens = require('../mocks/tokens');

tape('dashboardAdmins should throw error if options is null', function(t) {
  try {
    dashboardAdmins();
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('dashboardAdmins should throw error if options.secret is null', function(t) {
  try {
    dashboardAdmins({});
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('dashboardAdmins should throw error if options.secret is empty', function(t) {
  try {
    dashboardAdmins({
      secret: ''
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('dashboardAdmins should throw error if options.audience is null', function(t) {
  try {
    dashboardAdmins({
      secret: 'abc'
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('dashboardAdmins should throw error if options.audience is empty', function(t) {
  try {
    dashboardAdmins({
      secret: 'abc',
      audience: ''
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('dashboardAdmins should throw error if options.rta is empty', function(t) {
  try {
    dashboardAdmins({
      secret: 'abc',
      audience: 'urn:api',
      rta: ''
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('dashboardAdmins should throw error if options.domain is empty', function(t) {
  try {
    dashboardAdmins({
      secret: 'abc',
      audience: 'urn:api',
      rta: 'auth0.auth0.com',
      domain: ''
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('dashboardAdmins should throw error if options.baseUrl is null', function(t) {
  try {
    dashboardAdmins({
      secret: 'abc',
      audience: 'urn:api',
      rta: 'auth0.auth0.com',
      domain: 'test.auth0.com'
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('dashboardAdmins should throw error if options.baseUrl is empty', function(t) {
  try {
    dashboardAdmins({
      secret: 'abc',
      audience: 'urn:api',
      rta: 'auth0.auth0.com',
      domain: 'test.auth0.com',
      baseUrl: ''
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('dashboardAdmins should throw error if options.clientName is empty', function(t) {
  try {
    dashboardAdmins({
      secret: 'abc',
      audience: 'urn:api',
      rta: 'auth0.auth0.com',
      domain: 'test.auth0.com',
      baseUrl: 'http://api',
      clientName: ''
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('dashboardAdmins should throw error if options.storageType is incorrect', function(t) {
  try {
    dashboardAdmins({
      secret: 'abc',
      audience: 'urn:api',
      rta: 'auth0.auth0.com',
      domain: 'test.auth0.com',
      baseUrl: 'http://api',
      storageType: 'storageType',
      clientName: 'Some Client'
    });
  } catch (e) {
    t.ok(e);
    t.equal(e.name, 'ArgumentError');
    t.end();
  }
});

tape('dashboardAdmins should redirect to auth0 on /login', function(t) {
  const mw = dashboardAdmins({
    secret: 'abc',
    audience: 'urn:api',
    rta: 'auth0.auth0.com',
    domain: 'test.auth0.com',
    baseUrl: 'http://api',
    clientName: 'Some Client'
  });

  const cookies = {};

  const req = {
    headers: {},
    url: 'http://api/login',
    method: 'get'
  };

  const res = {
    cookie: function(key, value, options) {
      cookies[key] = value;
      t.equal(options.path, '/login/');
    },
    redirect: function(url) {
      const expectedUrl =
        'https://auth0.auth0.com/authorize' +
        '?client_id=http%3A%2F%2Fapi' +
        '&response_type=token id_token' +
        '&response_mode=form_post' +
        '&scope=openid%20name%20email' +
        '&expiration=36000' +
        '&redirect_uri=https%3A%2Flogin%2Flogin%2Fcallback&audience=https%3A%2F%2Ftest.auth0.com%2Fapi%2Fv2%2F' +
        '&nonce=' + cookies.nonce +
        '&state=' + cookies.state;
      t.ok(url);
      t.equal(url, expectedUrl);
      t.end();
    }
  };
  mw(req, res);
});

tape('dashboardAdmins should return ValidationError in case of nonce mismatch', function(t) {
  const mw = dashboardAdmins({
    secret: 'abc',
    audience: 'urn:api',
    rta: 'test.auth0.com',
    domain: 'test.auth0.com',
    baseUrl: 'https://test.auth0.com/api/v2/',
    clientName: 'Some Client'
  });

  const token = tokens.sign(certs.bar.private, 'key2', {
    iss: 'https://test.auth0.com/',
    sub: '1234567890',
    aud: 'https://test.auth0.com/api/v2/',
    name: 'John Doe',
    admin: true,
    nonce: 'nonce'
  });

  const req = {
    headers: {},
    cookies: {
      state: 'state',
      nonce: 'another_nonce'
    },
    body: {
      state: 'state',
      id_token: token,
      access_token: token
    },
    url: 'http://api/login/callback',
    method: 'post'
  };

  const next = function(err) {
    t.ok(err);
    t.equal(err.name, 'ValidationError');
    t.end();
  };

  mw(req, {}, next);
});

tape('dashboardAdmins should return ValidationError in case of legacy nonce mismatch', function(t) {
  const mw = dashboardAdmins({
    secret: 'abc',
    audience: 'urn:api',
    rta: 'test.auth0.com',
    domain: 'test.auth0.com',
    baseUrl: 'https://test.auth0.com/api/v2/',
    clientName: 'Some Client'
  });

  const token = tokens.sign(certs.bar.private, 'key2', {
    iss: 'https://test.auth0.com/',
    sub: '1234567890',
    aud: 'https://test.auth0.com/api/v2/',
    name: 'John Doe',
    admin: true,
    nonce: 'nonce'
  });

  const req = {
    headers: {},
    cookies: {
      state: 'state',
      nonce_compat: 'another_nonce'
    },
    body: {
      state: 'state',
      id_token: token,
      access_token: token
    },
    url: 'http://api/login/callback',
    method: 'post'
  };

  const next = function(err) {
    t.ok(err);
    t.equal(err.name, 'ValidationError');
    t.end();
  };

  mw(req, {}, next);
});

tape('dashboardAdmins should return ValidationError in case of state mismatch', function(t) {
  const mw = dashboardAdmins({
    secret: 'abc',
    audience: 'urn:api',
    rta: 'test.auth0.com',
    domain: 'test.auth0.com',
    baseUrl: 'https://test.auth0.com/api/v2/',
    clientName: 'Some Client'
  });

  const token = tokens.sign(certs.bar.private, 'key2', {
    iss: 'https://test.auth0.com/',
    sub: '1234567890',
    aud: 'https://test.auth0.com/api/v2/',
    name: 'John Doe',
    admin: true,
    nonce: 'nonce'
  });

  const req = {
    headers: {},
    cookies: {
      state: 'another_state',
      nonce: 'nonce'
    },
    body: {
      state: 'state',
      id_token: token,
      access_token: token
    },
    url: 'http://api/login/callback',
    method: 'post'
  };

  const next = function(err) {
    t.ok(err);
    t.equal(err.name, 'ValidationError');
    t.end();
  };

  mw(req, {}, next);
});

tape('dashboardAdmins should return ValidationError in case of legacy state mismatch', function(t) {
  const mw = dashboardAdmins({
    secret: 'abc',
    audience: 'urn:api',
    rta: 'test.auth0.com',
    domain: 'test.auth0.com',
    baseUrl: 'https://test.auth0.com/api/v2/',
    clientName: 'Some Client'
  });

  const token = tokens.sign(certs.bar.private, 'key2', {
    iss: 'https://test.auth0.com/',
    sub: '1234567890',
    aud: 'https://test.auth0.com/api/v2/',
    name: 'John Doe',
    admin: true,
    nonce: 'nonce'
  });

  const req = {
    headers: {},
    cookies: {
      state_compat: 'another_state',
      nonce: 'nonce'
    },
    body: {
      state: 'state',
      id_token: token,
      access_token: token
    },
    url: 'http://api/login/callback',
    method: 'post'
  };

  const next = function(err) {
    t.ok(err);
    t.equal(err.name, 'ValidationError');
    t.end();
  };

  mw(req, {}, next);
});

tape('dashboardAdmins should return 200 if everything is ok', function(t) {
  const mw = dashboardAdmins({
    secret: 'abc',
    audience: 'urn:api',
    rta: 'test.auth0.com',
    domain: 'test.auth0.com',
    baseUrl: 'https://test.auth0.com/api/v2/',
    clientName: 'Some Client'
  });

  tokens.wellKnownEndpoint('test.auth0.com', certs.bar.cert, 'key2');
  const token = tokens.sign(certs.bar.private, 'key2', {
    iss: 'https://test.auth0.com/',
    sub: '1234567890',
    aud: 'https://test.auth0.com/api/v2/',
    azp: 'https://test.auth0.com/api/v2/',
    name: 'John Doe',
    admin: true,
    nonce: 'nonce'
  });

  const req = {
    headers: {},
    cookies: {
      state: 'state',
      nonce: 'nonce'
    },
    body: {
      state: 'state',
      id_token: token,
      access_token: token
    },
    url: 'http://api/login/callback',
    method: 'post'
  };

  const res = {
    header: function() {},
    clearCookie: function(name) {
      if (name === 'nonce') t.equal(name, 'nonce');
      else t.equal(name, 'state');
    },
    status: function(status) {
      return {
        send: function(html) {
          t.ok(html);
          t.equal(status, 200);
          t.end();
        }
      };
    }
  };

  mw(req, res);
});

tape('dashboardAdmins should return 200 with legacy nonce and state', function(t) {
  const mw = dashboardAdmins({
    secret: 'abc',
    audience: 'urn:api',
    rta: 'test.auth0.com',
    domain: 'test.auth0.com',
    baseUrl: 'https://test.auth0.com/api/v2/',
    clientName: 'Some Client'
  });

  tokens.wellKnownEndpoint('test.auth0.com', certs.bar.cert, 'key2');
  const token = tokens.sign(certs.bar.private, 'key2', {
    iss: 'https://test.auth0.com/',
    sub: '1234567890',
    aud: 'https://test.auth0.com/api/v2/',
    azp: 'https://test.auth0.com/api/v2/',
    name: 'John Doe',
    admin: true,
    nonce: 'nonce'
  });

  const req = {
    headers: {},
    cookies: {
      state_compat: 'state',
      nonce_compat: 'nonce'
    },
    body: {
      state: 'state',
      id_token: token,
      access_token: token
    },
    url: 'http://api/login/callback',
    method: 'post'
  };

  const res = {
    header: function() {},
    clearCookie: function(name) {
      if (name === 'nonce') t.equal(name, 'nonce');
      else t.equal(name, 'state');
    },
    status: function(status) {
      return {
        send: function(html) {
          t.ok(html);
          t.equal(status, 200);
          t.end();
        }
      };
    }
  };

  mw(req, res);
});

tape('dashboardAdmins should work with localStorage', function(t) {
  const mw = dashboardAdmins({
    secret: 'abc',
    audience: 'urn:api',
    rta: 'test.auth0.com',
    domain: 'test.auth0.com',
    baseUrl: 'https://test.auth0.com/api/v2/',
    storageType: 'localStorage',
    clientName: 'Some Client'
  });

  tokens.wellKnownEndpoint('test.auth0.com', certs.bar.cert, 'key2');
  const token = tokens.sign(certs.bar.private, 'key2', {
    iss: 'https://test.auth0.com/',
    sub: '1234567890',
    aud: 'https://test.auth0.com/api/v2/',
    azp: 'https://test.auth0.com/api/v2/',
    name: 'John Doe',
    admin: true,
    nonce: 'nonce'
  });

  const req = {
    headers: {},
    cookies: {
      state: 'state',
      nonce: 'nonce'
    },
    body: {
      state: 'state',
      id_token: token,
      access_token: token
    },
    url: 'http://api/login/callback',
    method: 'post'
  };

  const res = {
    header: function() {},
    clearCookie: function(name) {
      if (name === 'nonce') t.equal(name, 'nonce');
      else t.equal(name, 'state');
    },
    status: function(status) {
      return {
        send: function(html) {
          t.ok(html && html.indexOf('localStorage') > 0);
          t.equal(status, 200);
          t.end();
        }
      };
    }
  };

  mw(req, res);
});
