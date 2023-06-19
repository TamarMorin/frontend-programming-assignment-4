import handle from '../pages/api/signup';
import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ServerApiVersion } from 'mongodb';
import cloudinary from 'cloudinary';
import { IncomingForm } from 'formidable';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';

jest.mock('mongodb');
jest.mock('cloudinary');
jest.mock('formidable');
jest.mock('bcrypt');

describe('API Tests', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let formParseMock: jest.Mock;

  beforeEach(() => {
    req = {
      method: 'POST',
      body: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    prisma.user.create = jest.fn();
    prisma.user.findFirst = jest.fn();

    formParseMock = jest.fn().mockImplementation((req, callback) => {
      const fields = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        fullName: req.body.fullName,
      };
      const files = {
        image: req.body.image,
      };
      callback(null, fields, files);
    });

    // Mock the implementation of Formidable's `IncomingForm` constructor
    (IncomingForm as jest.Mock).mockImplementation(() => ({
      parse: formParseMock,
    }));

    // Mock the bcrypt.hash function
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

    // Mock the Prisma user.create function
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

    // Clear the mocks for each test case
    jest.clearAllMocks();
  });

  it('should create a new user and return the result', async () => {
    const findOneMock = jest.fn().mockResolvedValue(null);
    const insertOneMock = jest.fn().mockResolvedValue({ insertedId: 1 });

    const collectionMock = {
      findOne: findOneMock,
      insertOne: insertOneMock,
    };

    const databaseMock = {
      collection: jest.fn().mockReturnValue(collectionMock),
    };

    const clientMock = {
      connect: jest.fn(),
      db: jest.fn().mockReturnValue(databaseMock),
    };

    // Mock the implementation of MongoClient
    (MongoClient as jest.Mock).mockImplementation(clientMock);

    // Mock the implementation of cloudinary.v2.uploader.upload
    (cloudinary.v2.uploader.upload as jest.Mock).mockResolvedValue({
      secure_url: 'https://example.com/image.jpg',
    });

    await handle(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User testuser created successfully',
    });
    expect(clientMock.connect).toHaveBeenCalled();
    expect(clientMock.db).toHaveBeenCalledWith('blog');
    expect(databaseMock.collection).toHaveBeenCalledWith('users');
    expect(collectionMock.insertOne).toHaveBeenCalledWith({
      username: 'testuser',
      fullName: 'Test User',
      password: 'hashedPassword',
      email: 'test@example.com',
      image: undefined,
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/image.jpg',
        posts: { create: [] },
      },
    });
  });
});
