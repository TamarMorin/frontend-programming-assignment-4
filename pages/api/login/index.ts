import {NextApiRequest, NextApiResponse} from "next";
import {MongoClient, ServerApiVersion} from "mongodb";
import cloudinary from "cloudinary";

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
import Cookies from 'universal-cookie';
import {use} from "react";

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


// Handle any requests to /api/login
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    // post requests
    if (req.method == 'POST') {
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;

        if (username === "" || password === "") {
            return res.status(401).json({message: "username and password must not be empty"})
        }


        // upload to mongodb
        try {
            await client.connect();
            const database = client.db('blog');
            const collection = database.collection('users');
            const user = await collection.findOne({
                username: username,
                email: email,
            });

            if (user === null) {
                console.log(`api/login username not exists ${username} ${password}`);
                return res.status(401).json({message: `Invalid Credentials`});
            }


            // check if passwords match with bcrypt compare
            let passwordIsValid = true;
            let outerErr = null;
            if (!await bcrypt.compare(password, user?.password)) {
                console.log(`api/login password not match ${username} ${password}`);
                return res.status(401).json({message: `Invalid Credentials`});
            }

            // if we reach here credentials are ok
            console.log(`api/login user logged in successfully ${username} ${password}`);

            // create token
            const userForToken = {
                username: user?.username,
                email: user?.email,
                id: user?._id.toString(),
            }

            const token = jwt.sign(userForToken, process.env.JWT_SECRET)
            //cookies.set('token', token);

            return res.status(200).json({"token": token, "username": username, message: "User logged in successfully"});

        } catch (error) {
            console.log(`api/login error ${error}`);
            return res.status(500).json({message: `Error login user ${username}, ${error}`});
        }
    }
}