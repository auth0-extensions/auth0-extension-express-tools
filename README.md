# Auth0 Extension Tools for Express

A set of tools and utilities to simplify the development of Auth0 Extensions with Epxress.

## Usage

```js
const expressTools = require('auth0-extension-express-tools');
```

### Start an Express Server.

Here's what you need to use it as an entrypoint for your Webtask:

```js
const expressApp = require('./server');

module.exports = expressTools.createServer(function(req, config, storage) {
  return expressApp(config, storage);
});
```

Then you can create your Express server like this:

```js
module.exports = (config, storage) => {
  // 'config' is a method that exposes process.env, Webtask params and secrets
  console.log('Starting Express. The Auth0 domain which this is configured for:', config('AUTH0_DOMAIN'));

  // 'storage' is a Webtask storage object: https://webtask.io/docs/storage
  storage.get(function (error, data) {
    console.log('Here is what we currently have in data:', JSON.stringify(data, null, 2));
  });

  const app = new Express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  ...

  // Finally you just have to return the app here.
  return app;
};
```

### Middlewares

#### Authentication Required Middleware

Force a user to be set on the request. If no user is present, an `UnauthorizedError` will be returned.

```js
const middlewares = require('auth0-extension-express-tools').middlewares;

const app = new Express();
...

app.get('/users/:id', middlewares.requireAuthentication, (req, res, next) => {
  ...
});
```

#### User Authentication Middleware

Validate an end user token using RS256.

```js
const authenticateUsers = require('auth0-extension-express-tools').authenticateUsers;

const app = new Express();
app.use(authenticateUsers({
  domain: 'me.auth0.com',
  audience: 'urn:myapp',
  credentialsRequired: true, // Default
  onLoginSuccess: (req, res, next) => {
    req.user.foo = 'bar';
    next();
  }
});)
```

You can also optionally set the middleware to only execute when a token is provided where the issuer matches the configured issuer. If not token is provided, or a token is provided with a different issuer, this middleware will not run.

```js
const authenticateUsers = require('auth0-extension-express-tools').authenticateUsers;

const app = new Express();
app.use(authenticateUsers.optional({
  domain: 'me.auth0.com',
  audience: 'urn:myapp',
  onLoginSuccess: (req, res, next) => {
    req.user.foo = 'bar';
    next();
  }
});)
```

#### Auth0 Administrator Authentication Middleware

Validate an administrator session token.

```js
const authenticateAdmins = require('auth0-extension-express-tools').authenticateAdmins;

const app = new Express();
app.use(authenticateAdmins({
  onLoginSuccess: (req, res, next) => {
    req.user.role = 'Admin';
    next();
  },
  credentialsRequired: true,
  secret: 'abc',
  audience: 'urn:api',
  baseUrl: 'http://my-extension'
});
```

You can also optionally set the middleware to only execute when a token is provided where the issuer matches the configured issuer. If not token is provided, or a token is provided with a different issuer, this middleware will not run.

```js
const authenticateUsers = require('auth0-extension-express-tools').authenticateUsers;

const app = new Express();
app.use(authenticateAdmins.optional({
  onLoginSuccess: (req, res, next) => {
    req.user.role = 'Admin';
    next();
  },
  credentialsRequired: true,
  secret: 'abc',
  audience: 'urn:api',
  baseUrl: 'http://my-extension'
});
```

#### API v2 Middleware

A middleware to inject the Management API Client for Node.js on the current request:

```js
const middlewares = require('auth0-extension-express-tools').middlewares;

const app = new Express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const managementClient = middlewares.managementApiClient({
  domain: config('AUTH0_DOMAIN'),
  clientId: config('AUTH0_CLIENT_ID'),
  clientSecret: config('AUTH0_CLIENT_SECRET')
});

app.get('/users/:id', managementClient, (req, res, next) => {
  req.auth0.users.get({ id: req.params.id })
    .then(user => res.json({ user }))
    .catch(next);
});
```

#### Hook Token Middleware

A middleware to validate tokens from the Management Dashboard when installing/updating/uninstalling Extensions:

```js
const middlewares = require('auth0-extension-express-tools').middlewares;

const app = new Express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const hookValidator = middlewares.validateHookToken(config('AUTH0_DOMAIN'), config('WT_URL'), config('EXTENSION_SECRET'));
app.use(hookValidator('./extensions/on-uninstall'));
app.delete('./extensions/on-uninstall', function(req, res) {
  ...
});
```

### Url Helpers

```js
const urlHelpers = require('auth0-extension-express-tools').urlHelpers;

// Eg: /api/run/mytenant/abc/
const basePath = urlHelpers.getBasePath(req);

// Eg: http://sandbox.it.auth0.com/api/run/mytenant/abc
const baseUrl = urlHelpers.getBaseUrl(req);
```
