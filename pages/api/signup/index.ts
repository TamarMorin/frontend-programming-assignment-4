import {NextApiRequest, NextApiResponse} from "next";
import {MongoClient, ServerApiVersion} from "mongodb";
import cloudinary from "cloudinary";

const bcrypt = require('bcrypt');

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
        const saltRounds = 10;
        let password = req.body.password;

        if (username === "" || password === "") {
            console.log(`Username or password is empty ${username} ${password}`);
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
            const resultExist = await collection.findOne({username: username});
            if (resultExist != null) {
                console.log(`Username already exists ${JSON.stringify(resultExist)}`);
                res.status(400).json({message: `Error signup user ${username}, user already exists`});
            }

            const result = await collection.insertOne({
                username: username,
                password: password,
            });

            // check if result is successful
            if (result.insertedId == null) {
                console.log("Error", result);
                res.status(500).json({message: `Error signup user ${username}`});
            }
            // success
            res.status(200).json({message: `User ${username} created successfully`});

        } catch (error) {
            res.status(500).json({message: `Error signup user ${username}, ${error}`});
        }

    }
}