import handle from "../pages/api/login";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MongoClient, ServerApiVersion } from "mongodb";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("mongodb");

let req: Partial<NextApiRequest>;
let res: Partial<NextApiResponse>;

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedMongoClient = MongoClient as jest.MockedClass<
  typeof MongoClient
>;

beforeEach(() => {
  req = {
    method: "POST",
    body: {
      username: "testuser",
      password: "password123",
      email: "test@example.com",
    },
  };
  res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
});

describe("login API", () => {
  it('should return "username and password must not be empty" if username or password is empty', async () => {
    req.body.username = "";
    req.body.password = "";

    await handle(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "username and password must not be empty",
    });
  });

  it('should return "Invalid Credentials" if user does not exist', async () => {
    const findOneMock = jest.fn().mockResolvedValue(null);
    mockedMongoClient.prototype.db.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        findOne: findOneMock,
      }),
    });

    await handle(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid Credentials",
    });
    expect(findOneMock).toHaveBeenCalledWith({
      username: "testuser",
      email: "test@example.com",
    });
  });

  it('should return "Invalid Credentials" if password does not match', async () => {
    const user = {
      username: "testuser",
      email: "test@example.com",
      password: "hashedPassword",
    };
    const findOneMock = jest.fn().mockResolvedValue(user);
    mockedMongoClient.prototype.db.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        findOne: findOneMock,
      }),
    });
    mockedBcrypt.compare.mockResolvedValue(false);

    await handle(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid Credentials",
    });
    expect(findOneMock).toHaveBeenCalledWith({
      username: "testuser",
      email: "test@example.com",
    });
    expect(mockedBcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedPassword"
    );
  });

  it('should return "User logged in successfully" if user exists and password matches', async () => {
    const user = {
      username: "testuser",
      email: "test@example.com",
      password: "hashedPassword",
      _id: "user_id",
    };
    const findOneMock = jest.fn().mockResolvedValue(user);
    mockedMongoClient.prototype.db.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        findOne: findOneMock,
      }),
    });
    mockedBcrypt.compare.mockResolvedValue(true);
    mockedJwt.sign.mockReturnValue("valid-token");

    await handle(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: "valid-token",
      username: "testuser",
      message: "User logged in successfully",
    });
    expect(findOneMock).toHaveBeenCalledWith({
      username: "testuser",
      email: "test@example.com",
    });
    expect(mockedBcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedPassword"
    );
    expect(mockedJwt.sign).toHaveBeenCalledWith(
      {
        username: "testuser",
        email: "test@example.com",
        id: "user_id",
      },
      process.env.JWT_SECRET
    );
  });

  it('should return "Error login user" if an error occurs while connecting to the database', async () => {
    mockedMongoClient.prototype.connect.mockRejectedValue(new Error("DB error"));

    await handle(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error login user testuser, Error: DB error",
    });
  });
});
