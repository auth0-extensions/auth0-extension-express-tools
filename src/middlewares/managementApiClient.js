const tools = require('auth0-extension-tools');

module.exports = function(options) {
  return function(req, res, next) {
    const request = req;
    tools.managementApi.getClient(options)
      .then(function(auth0) {
        request.auth0 = auth0;
        return next();
      })
      .catch(function(err) {
        next(err);
      });
  };
};
