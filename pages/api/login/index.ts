import {NextApiRequest, NextApiResponse} from "next";
import {MongoClient, ServerApiVersion} from "mongodb";
import cloudinary from "cloudinary";

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
import Cookies from 'universal-cookie';
import { use } from "react";

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

        if (username === "" || password === "") {
            res.status(400).json({message: "username and password must not be empty"})
        }


        // upload to mongodb
        try {
            await client.connect();
            const database = client.db('blog');

            // apply schema validation - for now we do it manually every time! (it's bad practice)
            // await database.command({
            //     collMod: 'users',
            //     validator: {
            //         $jsonSchema: {
            //             bsonType: 'object',
            //             title: "Users collection validation",
            //             required: ['username', 'password'],
            //             uniqueFields: ['username'],
            //             properties: {
            //                 username: {
            //                     bsonType: 'string',
            //                     description: 'must be a string and is required',
            //                 },
            //                 password: {
            //                     bsonType: 'string',
            //                     description: 'must be a string and is required',
            //                 }
            //             },
            //         }
            //     },
            // });
            const collection = database.collection('users');
            const user = await collection.findOne({
                username: username,
            });

            if (user === null) {
                console.log(`api/login username not exists ${username} ${password}`);
                res.status(401).json({message: `Invalid Credentials`})
            }
            // check if passwords match with bcrypt compare
            bcrypt.compare(password, user.password, function(err, res2) {
                if (err) {
                    console.log(`error in bcrypt compare func`);
                    res.status(500).json({success: false, message: 'error in bcrypt compare func'});
                }
                if(req.body.password != user?.password){
                    console.log(`api/login password is not correct`);
                    res.status(400).json({success: false, message: 'passwords do not match'});
                }
            });
            // if we reach here credentials are ok

            const userForToken = {
                username: user?.username,
                id: user?._id.toString(),
            }

            const token = jwt.sign({username: user?.username, id: user?._id.toString()}, process.env.JWT_SECRET)
            cookies.set('token', token);

            res.status(200).json({"token": token, "username": username, message: "User logged in successfully"});

        } catch (error) {
            console.log(`api/login error ${error}`);
            res.status(500).json({message: `Error login user ${username}, ${error}`});
        }
    }
}