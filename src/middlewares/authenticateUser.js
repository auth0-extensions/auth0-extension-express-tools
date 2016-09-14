const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const tools = require('auth0-extension-tools');

module.exports = function(domain, audience) {
  return jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://' + domain + '/.well-known/jwks.json',
      handleSigningKeyError: function(err, cb) {
        if (err instanceof jwksRsa.SigningKeyNotFoundError) {
          return cb(new tools.UnauthorizedError('A token was provided with an invalid kid'));
        }

        return cb(err);
      }
    }),

    // Validate the audience and the issuer.
    audience: audience,
    issuer: 'https://' + domain + '/',
    algorithms: [ 'RS256' ]
  });
};
