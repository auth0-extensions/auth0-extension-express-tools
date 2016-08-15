const tools = require('auth0-extension-tools');
const Webtask = require('webtask-tools');

module.exports.createServer = function(cb) {
  return Webtask.fromExpress(tools.createServer(cb));
};
