import {NextApiRequest, NextApiResponse} from "next";
import {MongoClient, ServerApiVersion} from "mongodb";
import cloudinary from "cloudinary";
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
import Cookies from 'universal-cookie';

require('dotenv').config();

const cookies = new Cookies();

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Handle any requests to /api/signin
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    // post requests
    if (req.method == 'POST') {
        const username = req.body.username;
        const email = req.body.email;
        const saltRounds = 10;
        const password = bcrypt.hash(req.body.password, saltRounds);

        // upload to mongodb
        try {
            await client.connect();
            const database = client.db('blog');
            const collection = database.collection('users');
            const result = await collection.insertOne({
                username: username,
                password: password,
            });
            // check if result is successful
            if (result.insertedId == null) {
                res.status(500).json({message: `Error logging`});
            }

            const userForToken = {
                username: username,
                id: result.insertedId,
            }
            const token = jwt.token({username: username, id: result.insertedId}, process.env.JWT_SECRET)
            cookies.set('token', token);

            res.status(200).json({ token, username: username, message: "User logged in successfully"});

        } catch (error) {
            res.status(500).json({message: `Error login user ${username}, ${error}`});
        }
    }
}