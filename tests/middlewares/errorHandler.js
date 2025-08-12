const { expect } = require('chai');

const tools = require('auth0-extension-tools');
const errorHandlerMiddleware = require('../../src/middlewares').errorHandler;

describe('errorHandler', function() {
  it('should return 500 by default', function() {
    var statusCode = 0;
    var err = null;

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

    expect(err).to.exist;
    expect(err.error).to.equal('InternalServerError');
    expect(err.message).to.equal('foo');
    expect(statusCode).to.equal(500);
  });

  it('should return status of the error if available', function() {
    var statusCode = 0;
    var err = null;

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

    expect(err).to.exist;
    expect(err.error).to.equal('NotFoundError');
    expect(err.message).to.equal('foo');
    expect(statusCode).to.equal(404);
  });

  it('should log the error correctly', function() {
    var err = null;

    errorHandlerMiddleware((error) => { err = error; })(
      new tools.NotFoundError('foo'),
      { },
      {
        status: () => { },
        json: () => { }
      }
    );

    expect(err).to.exist;
    expect(err.name).to.equal('NotFoundError');
  });
});
