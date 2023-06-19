import handle from '../pages/api/signup';
import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
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

    // Mock the Prisma post.create function
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user and return the result', async () => {
    const clientMock = new MongoClient();
    const collectionMock = {
      findOne: jest.fn().mockResolvedValue(null),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 1 }),
    };

    // Mock the implementation of MongoClient's connect method
    (MongoClient as jest.Mock).mockResolvedValueOnce(clientMock);

    // Mock the implementation of MongoClient's db method
    clientMock.db = jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue(collectionMock),
    });

    // Mock the implementation of cloudinary.v2.uploader.upload
    (cloudinary.v2.uploader.upload as jest.Mock).mockResolvedValue({
      secure_url: 'https://example.com/image.jpg',
    });

    await handle(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User testuser created successfully',
    });
    expect(collectionMock.insertOne).toHaveBeenCalledWith({
      username: 'testuser',
      fullName: 'Test User',
      password: 'hashedPassword',
      email: 'test@example.com',
      image: undefined,
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        username: 'testuser',
        fullName: 'Test User',
        password: 'hashedPassword',
        email: 'test@example.com',
        image: 'https://example.com/image.jpg',
        posts: { create: [] },
      },
    });
  });
});
