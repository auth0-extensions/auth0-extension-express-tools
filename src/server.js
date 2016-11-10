const tools = require('auth0-extension-tools');
const Webtask = require('webtask-tools');

module.exports.createServer = function(cb) {
  const serverFn = tools.createServer(cb);
  let dispatchFn = null;

  return Webtask.fromExpress(function requestHandler(req, res) {
    if (!dispatchFn) {
      dispatchFn = serverFn(req.webtaskContext);
    }

    return dispatchFn(req, res);
  });
};
