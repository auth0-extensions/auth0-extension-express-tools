const express = require('express');
const expressJwt = require('express-jwt');
const tools = require('auth0-extension-tools');

const urlHelpers = require('./urlHelpers');

module.exports = function(options) {
  if (!options || typeof options !== 'object') {
    throw new tools.ArgumentError('Must provide the options');
  }

  if (options.onLoginSuccess === null || options.onLoginSuccess === undefined) {
    throw new tools.ArgumentError('Must provide a valid login callback');
  }

  if (options.secret === null || options.secret === undefined) {
    throw new tools.ArgumentError('Must provide a valid secret');
  }

  if (typeof options.secret !== 'string' || options.secret.length === 0) {
    throw new tools.ArgumentError('The provided secret is invalid: ' + options.secret);
  }

  if (options.audience === null || options.audience === undefined) {
    throw new tools.ArgumentError('Must provide a valid secret');
  }

  if (typeof options.audience !== 'string' || options.audience.length === 0) {
    throw new tools.ArgumentError('The provided audience is invalid: ' + options.audience);
  }

  if (options.rta === null || options.rta === undefined) {
    throw new tools.ArgumentError('Must provide a valid rta');
  }

  if (typeof options.rta !== 'string' || options.rta.length === 0) {
    throw new tools.ArgumentError('The provided rta is invalid: ' + options.rta);
  }

  if (options.domain === null || options.domain === undefined) {
    throw new tools.ArgumentError('Must provide a valid domain');
  }

  if (typeof options.domain !== 'string' || options.domain.length === 0) {
    throw new tools.ArgumentError('The provided domain is invalid: ' + options.domain);
  }

  if (options.baseUrl === null || options.baseUrl === undefined) {
    throw new tools.ArgumentError('Must provide a valid base URL');
  }

  if (typeof options.baseUrl !== 'string' || options.baseUrl.length === 0) {
    throw new tools.ArgumentError('The provided base URL is invalid: ' + options.baseUrl);
  }

  if (options.clientName === null || options.clientName === undefined) {
    throw new tools.ArgumentError('Must provide a valid client name');
  }

  if (typeof options.clientName !== 'string' || options.clientName.length === 0) {
    throw new tools.ArgumentError('The provided client name is invalid: ' + options.clientName);
  }

  const sessionStorageKey = options.sessionStorageKey || 'apiToken';
  const urlPrefix = options.urlPrefix || '';

  const jwt = expressJwt({
    audience: options.audience,
    issuer: options.baseUrl,
    secret: options.secret,
    algorithms: [ 'HS256' ],
    credentialsRequired: false
  });

  const router = express.Router();
  router.get(urlPrefix + '/login', function(req, res) {
    const sessionManager = new tools.SessionManager(options.rta, options.domain, options.baseUrl);
    res.redirect(sessionManager.createAuthorizeUrl({
      redirectUri: urlHelpers.getBaseUrl(req) + urlPrefix + '/login/callback',
      scopes: options.scopes,
      expiration: options.expiration
    }));
  });

  router.post(urlPrefix + '/login/callback', function(req, res, next) {
    const sessionManager = new tools.SessionManager(options.rta, options.domain, options.baseUrl);
    sessionManager.create(req.body.id_token, req.body.access_token, {
      secret: options.secret,
      issuer: options.baseUrl,
      audience: options.audience
    }).then(function(token) {
      res.header('Content-Type', 'text/html');
      res.status(200).send('<html>' +
        '<head>' +
          '<script type="text/javascript">' +
            'sessionStorage.setItem("' + sessionStorageKey + '", "' + token + '");' +
            'window.location.href = "' + urlHelpers.getBaseUrl(req) + '";' +
          '</script>' +
      '</html>');
    })
    .catch(function(err) {
      next(err);
    });
  });

  router.get(urlPrefix + '/logout', function(req, res) {
    const encodedBaseUrl = encodeURIComponent(urlHelpers.getBaseUrl(req));
    res.header('Content-Type', 'text/html');
    res.status(200).send('<html>' +
      '<head>' +
        '<script type="text/javascript">' +
          'sessionStorage.removeItem("' + sessionStorageKey + '");' +
          'window.location.href = "https://"' + options.rta + '"/v2/logout/?returnTo=' + encodedBaseUrl + '&client_id=' + encodedBaseUrl + '";' +
        '</script>' +
    '</html>');
  });

  router.get('/.well-known/oauth2-client-configuration', function(req, res) {
    res.header('Content-Type', 'application/json');
    res.status(200).send({
      redirect_uris: [ urlHelpers.getBaseUrl(req) + urlPrefix + '/login/callback' ],
      client_name: options.clientName,
      post_logout_redirect_uris: [ urlHelpers.getBaseUrl(req) ]
    });
  });

  return {
    middleware: function(req, res, next) {
      jwt(req, res, function(err) {
        if (err) {
          return next(err);
        }

        if (options.onLoginSuccess) {
          return options.onLoginSuccess(req, res, next);
        }

        return next();
      });
    },
    routes: router
  };
};
