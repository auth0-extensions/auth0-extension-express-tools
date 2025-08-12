const { expect } = require("chai");

const dashboardAdmins = require("../../src/routes").dashboardAdmins;
const certs = require("../mocks/certs");
const tokens = require("../mocks/tokens");

describe("dashboardAdmins", function () {
  it("should throw error if options is null", function () {
    expect(() => {
      dashboardAdmins();
    }).to.throw();
  });

  it("should throw error if options.secret is null", function () {
    expect(() => {
      dashboardAdmins({});
    }).to.throw();
  });

  it("should throw error if options.secret is empty", function () {
    expect(() => {
      dashboardAdmins({
        secret: "",
      });
    }).to.throw();
  });

  it("should throw error if options.audience is null", function () {
    expect(() => {
      dashboardAdmins({
        secret: "abc",
      });
    }).to.throw();
  });

  it("should throw error if options.audience is empty", function () {
    expect(() => {
      dashboardAdmins({
        secret: "abc",
        audience: "",
      });
    }).to.throw();
  });

  it("should throw error if options.rta is empty", function () {
    expect(() => {
      dashboardAdmins({
        secret: "abc",
        audience: "urn:api",
        rta: "",
      });
    }).to.throw();
  });

  it("should throw error if options.domain is empty", function () {
    expect(() => {
      dashboardAdmins({
        secret: "abc",
        audience: "urn:api",
        rta: "auth0.auth0.com",
        domain: "",
      });
    }).to.throw();
  });

  it("should throw error if options.baseUrl is null", function () {
    expect(() => {
      dashboardAdmins({
        secret: "abc",
        audience: "urn:api",
        rta: "auth0.auth0.com",
        domain: "test.auth0.com",
      });
    }).to.throw();
  });

  it("should throw error if options.baseUrl is empty", function () {
    expect(() => {
      dashboardAdmins({
        secret: "abc",
        audience: "urn:api",
        rta: "auth0.auth0.com",
        domain: "test.auth0.com",
        baseUrl: "",
      });
    }).to.throw();
  });

  it("should throw error if options.clientName is empty", function () {
    expect(() => {
      dashboardAdmins({
        secret: "abc",
        audience: "urn:api",
        rta: "auth0.auth0.com",
        domain: "test.auth0.com",
        baseUrl: "http://api",
        clientName: "",
      });
    }).to.throw();
  });

  it("should throw error if options.storageType is incorrect", function () {
    expect(() => {
      dashboardAdmins({
        secret: "abc",
        audience: "urn:api",
        rta: "auth0.auth0.com",
        domain: "test.auth0.com",
        baseUrl: "http://api",
        storageType: "storageType",
        clientName: "Some Client",
      });
    }).to.throw();
  });

  it("should redirect to auth0 on /login", function (done) {
    const mw = dashboardAdmins({
      secret: "abc",
      audience: "urn:api",
      rta: "auth0.auth0.com",
      domain: "test.auth0.com",
      baseUrl: "http://api",
      clientName: "Some Client",
    });

    const cookies = {};

    const req = {
      headers: {},
      url: "http://api/login",
      method: "get",
    };

    const res = {
      cookie: function (key, value, options) {
        cookies[key] = value;
        expect(options.httpOnly).to.equal(true);
        expect(options.path).to.equal("/login/");
        if (!key.includes("_compat")) {
          expect(options.sameSite).to.equal("None");
          expect(options.secure).to.equal(true);
        } else {
          expect(options.sameSite).to.equal(undefined);
          expect(options.secure).to.equal(undefined);
        }
      },
      redirect: function (url) {
        const expectedUrl =
          "https://auth0.auth0.com/authorize" +
          "?client_id=http%3A%2F%2Fapi" +
          "&response_type=token id_token" +
          "&response_mode=form_post" +
          "&scope=openid%20name%20email" +
          "&expiration=36000" +
          "&redirect_uri=https%3A%2Flogin%2Flogin%2Fcallback&audience=https%3A%2F%2Ftest.auth0.com%2Fapi%2Fv2%2F" +
          "&nonce=" +
          (cookies.nonce || cookies["nonce_compat"]) +
          "&state=" +
          (cookies.state || cookies["state_compat"]);
        expect(url).to.exist;
        expect(url).to.equal(expectedUrl);
        done();
      },
    };

    mw(req, res, (err) => {
      if (err) {
        done(err);
      }
    });
  });

  it("should return ValidationError in case of nonce mismatch", function (done) {
    const mw = dashboardAdmins({
      secret: "abc",
      audience: "urn:api",
      rta: "test.auth0.com",
      domain: "test.auth0.com",
      baseUrl: "https://test.auth0.com/api/v2/",
      clientName: "Some Client",
    });

    const token = tokens.sign(certs.bar.private, "key2", {
      iss: "https://test.auth0.com/",
      sub: "1234567890",
      aud: "https://test.auth0.com/api/v2/",
      name: "John Doe",
      admin: true,
      nonce: "nonce",
    });

    const req = {
      headers: {},
      cookies: {
        state: "state",
        nonce: "another_nonce",
      },
      body: {
        state: "state",
        id_token: token,
        access_token: token,
      },
      url: "http://api/login/callback",
      method: "post",
    };

    const next = function (err) {
      expect(err).to.exist;
      expect(err.name).to.equal("ValidationError");
      done();
    };

    mw(req, {}, next);
  });

  it("should return ValidationError in case of legacy nonce mismatch", function (done) {
    const mw = dashboardAdmins({
      secret: "abc",
      audience: "urn:api",
      rta: "test.auth0.com",
      domain: "test.auth0.com",
      baseUrl: "https://test.auth0.com/api/v2/",
      clientName: "Some Client",
    });

    const token = tokens.sign(certs.bar.private, "key2", {
      iss: "https://test.auth0.com/",
      sub: "1234567890",
      aud: "https://test.auth0.com/api/v2/",
      name: "John Doe",
      admin: true,
      nonce_compat: "nonce",
    });

    const req = {
      headers: {},
      cookies: {
        state: "state",
        nonce_compat: "another_nonce",
      },
      body: {
        state: "state",
        id_token: token,
        access_token: token,
      },
      url: "http://api/login/callback",
      method: "post",
    };

    const next = function (err) {
      expect(err).to.exist;
      expect(err.name).to.equal("ValidationError");
      done();
    };

    mw(req, {}, next);
  });
  it("should return ValidationError in case of state mismatch", function (done) {
    const mw = dashboardAdmins({
      secret: "abc",
      audience: "urn:api",
      rta: "test.auth0.com",
      domain: "test.auth0.com",
      baseUrl: "https://test.auth0.com/api/v2/",
      clientName: "Some Client",
    });

    const token = tokens.sign(certs.bar.private, "key2", {
      iss: "https://test.auth0.com/",
      sub: "1234567890",
      aud: "https://test.auth0.com/api/v2/",
      name: "John Doe",
      admin: true,
      nonce: "nonce",
    });

    const req = {
      headers: {},
      cookies: {
        state: "another_state",
        nonce: "nonce",
      },
      body: {
        state: "state",
        id_token: token,
        access_token: token,
      },
      url: "http://api/login/callback",
      method: "post",
    };

    const next = function (err) {
      expect(err).to.exist;
      expect(err.name).to.equal("ValidationError");
      done();
    };

    mw(req, {}, next);
  });

  it("should return ValidationError in case of legacy state mismatch", function (done) {
    const mw = dashboardAdmins({
      secret: "abc",
      audience: "urn:api",
      rta: "test.auth0.com",
      domain: "test.auth0.com",
      baseUrl: "https://test.auth0.com/api/v2/",
      clientName: "Some Client",
    });

    const token = tokens.sign(certs.bar.private, "key2", {
      iss: "https://test.auth0.com/",
      sub: "1234567890",
      aud: "https://test.auth0.com/api/v2/",
      name: "John Doe",
      admin: true,
      state_compat: "state",
      nonce: "nonce",
    });

    const req = {
      headers: {},
      cookies: {
        state_compat: "another_state",
        nonce: "nonce",
      },
      body: {
        state: "state",
        id_token: token,
        access_token: token,
      },
      url: "http://api/login/callback",
      method: "post",
    };

    const next = function (err) {
      expect(err).to.exist;
      expect(err.name).to.equal("ValidationError");
      done();
    };

    mw(req, {}, next);
  });

  it("should return 200 if everything is ok", function (done) {
    const mw = dashboardAdmins({
      secret: "abc",
      audience: "urn:api",
      rta: "test.auth0.com",
      domain: "test.auth0.com",
      baseUrl: "https://test.auth0.com/api/v2/",
      clientName: "Some Client",
    });

    tokens.wellKnownEndpoint("test.auth0.com", certs.bar.cert, "key2");
    const token = tokens.sign(certs.bar.private, "key2", {
      iss: "https://test.auth0.com/",
      sub: "1234567890",
      aud: "https://test.auth0.com/api/v2/",
      azp: "https://test.auth0.com/api/v2/",
      name: "John Doe",
      admin: true,
      nonce: "nonce",
      exp: new Date().getTime(),
    });

    const req = {
      headers: {},
      cookies: {
        state: "state",
        nonce: "nonce",
      },
      body: {
        state: "state",
        id_token: token,
        access_token: token,
      },
      url: "http://api/login/callback",
      method: "post",
    };

    const res = {
      header: function () {},
      clearCookie: function (name) {
        if (name === "nonce") expect(name).to.equal("nonce");
        else if (name === "nonce_compat") expect(name).to.equal("nonce_compat");
        else if (name === "state") expect(name).to.equal("state");
        else expect(name).to.equal("state_compat");
      },
      status: function (status) {
        return {
          send: function (html) {
            expect(html).to.exist;
            expect(status).to.equal(200);
            done();
          },
        };
      },
    };

    mw(req, res, (err) => {
      if (err) {
        done(err);
      }
    });
  });

  it("should return 200 with legacy nonce and state", function (done) {
    const mw = dashboardAdmins({
      secret: "abc",
      audience: "urn:api",
      rta: "test.auth0.com",
      domain: "test.auth0.com",
      baseUrl: "https://test.auth0.com/api/v2/",
      clientName: "Some Client",
    });

    tokens.wellKnownEndpoint("test.auth0.com", certs.bar.cert, "key2");
    const token = tokens.sign(certs.bar.private, "key2", {
      iss: "https://test.auth0.com/",
      sub: "1234567890",
      aud: "https://test.auth0.com/api/v2/",
      azp: "https://test.auth0.com/api/v2/",
      name: "John Doe",
      admin: true,
      nonce: "nonce",
      exp: new Date().getTime(),
    });

    const req = {
      headers: {},
      cookies: {
        state_compat: "state",
        nonce_compat: "nonce",
      },
      body: {
        state: "state",
        id_token: token,
        access_token: token,
      },
      url: "http://api/login/callback",
      method: "post",
    };

    const res = {
      header: function () {},
      clearCookie: function (name) {
        if (name === "nonce") expect(name).to.equal("nonce");
        else if (name === "nonce_compat") expect(name).to.equal("nonce_compat");
        else if (name === "state") expect(name).to.equal("state");
        else expect(name).to.equal("state_compat");
      },
      status: function (status) {
        return {
          send: function (html) {
            expect(html).to.exist;
            expect(status).to.equal(200);
            done();
          },
        };
      },
    };

    mw(req, res, (err) => {
      if (err) {
        done(err);
      }
    });
  });

  it("should work with localStorage", function (done) {
    const mw = dashboardAdmins({
      secret: "abc",
      audience: "urn:api",
      rta: "test.auth0.com",
      domain: "test.auth0.com",
      baseUrl: "https://test.auth0.com/api/v2/",
      storageType: "localStorage",
      clientName: "Some Client",
    });

    tokens.wellKnownEndpoint("test.auth0.com", certs.bar.cert, "key2");
    const token = tokens.sign(certs.bar.private, "key2", {
      iss: "https://test.auth0.com/",
      sub: "1234567890",
      aud: "https://test.auth0.com/api/v2/",
      azp: "https://test.auth0.com/api/v2/",
      name: "John Doe",
      admin: true,
      nonce: "nonce",
      exp: new Date().getTime(),
    });

    const req = {
      headers: {},
      cookies: {
        state: "state",
        nonce: "nonce",
      },
      body: {
        state: "state",
        id_token: token,
        access_token: token,
      },
      url: "http://api/login/callback",
      method: "post",
    };

    const res = {
      header: function () {},
      clearCookie: function (name) {
        if (name === "nonce") expect(name).to.equal("nonce");
        else if (name === "nonce_compat") expect(name).to.equal("nonce_compat");
        else if (name === "state") expect(name).to.equal("state");
        else expect(name).to.equal("state_compat");
      },
      status: function (status) {
        return {
          send: function (html) {
            expect(html && html.indexOf("localStorage") > 0).to.be.true;
            expect(status).to.equal(200);
            done();
          },
        };
      },
    };

    mw(req, res, (err) => {
      if (err) {
        done(err);
      }
    });
  });
});
