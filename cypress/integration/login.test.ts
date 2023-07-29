import { MongoClient, ServerApiVersion } from "mongodb";

/// <reference types="Cypress" />

describe("login API", () => {
  
  it('should return "username and password must not be empty" if username or password is empty', () => {
    cy.request({
      method: "POST",
      url: "/api/login",
      body: {
        username: "",
        password: "",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({
        message: "username and password must not be empty",
      });
    });
  });

  it('should return "Invalid Credentials" if user does not exist', () => {
    cy.intercept("POST", "/api/login", (req) => {
      req.reply({
        statusCode: 401,
        body: {
          message: "Invalid Credentials",
        },
      });
    });

    cy.request({
      method: "POST",
      url: "/api/login",
      body: {
        username: "testuser",
        password: "password123",
        email: "test@example.com",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({
        message: "Invalid Credentials",
      });
    });
  });

  it('should return "Invalid Credentials" if password does not match', () => {
    cy.intercept("POST", "/api/login", (req) => {
      const user = {
        username: "test1",
        email: "test1@gmail.com",
        password: "hashedPassword",
      };
      req.reply({
        statusCode: 200,
        body: user,
      });
    });

    cy.request({
      method: "POST",
      url: "/api/login",
      body: {
        username: "test1",
        password: "123",
        email: "test1@gmail.com",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({
        message: "Invalid Credentials",
      });
    });
  });

  it('should return "User logged in successfully" if user exists and password matches', () => {
    cy.intercept("POST", "/api/login", (req) => {
      const user = {
        username: "test1",
        email: "test1@gmail.com",
        password: "hashedPassword",
        _id: "user_id",
      };

      req.reply({
        statusCode: 200,
        body: {
          ...user,
          token: Cypress.env("validToken"),
        },
      });
    });

    cy.request({
      method: "POST",
      url: "/api/login",
      body: {
        username: "test1",
        password: "1234",
        email: "test1@gmail.com",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("token").to.be.a("string");
      expect(response.body).to.have.property("username", "test1");
      expect(response.body).to.have.property("message", "User logged in successfully");
    });
  });
  it('should return "Invalid Credentials" if email is not valid', () => {
    cy.request({
      method: "POST",
      url: "/api/login",
      body: {
        username: "test1",
        password: "1234",
        email: "invalid-email-format",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({
        message: "Invalid Credentials",
      });
    });
  });


});
