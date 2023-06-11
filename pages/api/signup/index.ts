import {NextApiRequest, NextApiResponse} from "next";
import {MongoClient, ServerApiVersion} from "mongodb";
import cloudinary from "cloudinary";

const bcrypt = require('bcrypt');
import {PrismaClient, Prisma} from '@prisma/client'


const prisma = new PrismaClient()

require('dotenv').config();

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Handle any requests to /api/singup
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'POST') {
        const username = req.body.username;
        const email = req.body.email;
        const saltRounds = 10;
        let password = req.body.password;

        if (username === "" || password === "" || email === "") {
            console.log(`Username or password or email is empty ${username} ${password}`);
            res.status(400).json({message: `Error signup user ${username}, username or password is empty`});
        }

        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) {
                res.status(500).json({message: `Error logging ${err}`});
            }
            password = hash;
        });

        // upload to mongodb
        try {
            await client.connect();
            const database = client.db('blog');
            const collection = database.collection('users');

            // check if user already exists
            const resultExist = await collection.findOne({username: username, email: email});
            if (resultExist != null) {
                console.log(`Username already exists ${JSON.stringify(resultExist)}`);
                return res.status(400).json({message: `Error signup user ${username}, user already exists`});
            }

            const result = await collection.insertOne({
                username: username,
                password: password,
                email: email,
            });

            // check if result is successful
            if (result.insertedId == null) {
                console.log("Error", result);
                return res.status(500).json({message: `Error signup user ${username}`});
            }


            // create same user in prisma
            console.log(`Creating user with username: ${username} and email: ${email} in prisma db`);
            try {
                const user = await prisma.user.create({
                    data: {
                        name: username,
                        email: email,
                        posts: {
                            create: [],
                        },
                    },
                })
                console.log(`Created user with id: ${user.id}`)
            } catch (error) {
                console.log(`Error creating user with username: ${username} and email: ${email} in prisma db`);
                console.log(`Error: ${error}`);
                return res.status(500).json({message: `Error signup user ${username}, ${error}`});

            } finally {
                await prisma.$disconnect();
            }


            // success
            return res.status(200).json({message: `User ${username} created successfully`});

        } catch (error) {
            return res.status(500).json({message: `Error signup user ${username}, ${error}`});
        }

    }
}