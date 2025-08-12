const nock = require('nock');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports.wellKnownEndpoint = function(domain, cert, kid) {
  // Extract the public key components from the certificate
  const publicKey = crypto.createPublicKey(cert);
  const jwk = publicKey.export({ format: 'jwk' });
  
  return nock('https://' + domain)
    .get('/.well-known/jwks.json')
    .reply(200, {
      keys: [
        {
          alg: 'RS256',
          use: 'sig',
          x5c: [ cert.match(/-----BEGIN CERTIFICATE-----([\s\S]*)-----END CERTIFICATE-----/i)[1].replace('\n', '') ],
          kid: kid,
          kty: jwk.kty,
          n: jwk.n,
          e: jwk.e,
        }
      ]
    });
};

module.exports.sign = function(cert, kid, payload) {
  return jwt.sign(payload, cert, { header: { kid: kid }, algorithm: 'RS256' });
};
