const tape = require('tape');

const tools = require('auth0-extension-tools');
const errorHandlerMiddleware = require('../../src/middlewares').errorHandler;

tape('errorHandler should return 500 by default', function(t) {
  let statusCode = 0;
  let err = null;

  errorHandlerMiddleware()(
    new Error('foo'),
    { },
    {
      status: (code) => {
        statusCode = code;
      },
      json: (obj) => {
        err = obj;
      }
    }
  );

  t.ok(err);
  t.equal(err.error, 'InternalServerError');
  t.equal(err.message, 'foo');
  t.equal(statusCode, 500);
  t.end();
});

tape('errorHandler should return status of the error if available', function(t) {
  let statusCode = 0;
  let err = null;

  errorHandlerMiddleware()(
    new tools.NotFoundError('foo'),
    { },
    {
      status: (code) => {
        statusCode = code;
      },
      json: (obj) => {
        err = obj;
      }
    }
  );

  t.ok(err);
  t.equal(err.error, 'NotFoundError');
  t.equal(err.message, 'foo');
  t.equal(statusCode, 404);
  t.end();
});

tape('errorHandler should log the error correctly', function(t) {
  let err = null;

  errorHandlerMiddleware((error) => { err = error; })(
    new tools.NotFoundError('foo'),
    { },
    {
      status: () => { },
      json: () => { }
    }
  );

  t.ok(err);
  t.equal(err.name, 'NotFoundError');
  t.end();
});
