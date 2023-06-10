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
        let password = req.body.password;
        //const email = req.body.email;
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, function(err, hash) {
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
            const result = await collection.findOne({
                username: username,
                password: password,
            });
            // check if result is successful
            if (result == null) {
                res.status(401).json({message: `Invalid Credentials`})
            }

            const userForToken = {
                username: result?.username,
                id: result?._id.toString(),
            }

            const token = jwt.token({username: result?.username, id: result?._id.toString()}, process.env.JWT_SECRET)
            cookies.set('token', token);

            res.status(200).json({ token, username: username, message: "User logged in successfully"});

        } catch (error) {
            res.status(500).json({message: `Error login user ${username}, ${error}`});
        }
    }
}