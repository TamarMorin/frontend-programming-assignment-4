import type {NextApiRequest, NextApiResponse} from 'next'
import prisma from '../../../lib/prisma'
import {IncomingForm} from "formidable";
import {MongoClient, ServerApiVersion} from "mongodb";
import cloudinary from "cloudinary";
import Cookies from "universal-cookie";
import { csrf } from "../../../lib/csrf";


const jwt = require('jsonwebtoken')

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

export const config = {
    api: {
        bodyParser: false
    }
};

// POST /api/post
// Required fields in body: title
// Optional fields in body: content
async function handle(req: NextApiRequest, res: NextApiResponse) {
    let responseJsonObj = {};
    if (req.method === 'POST') {

        const data = await new Promise((resolve, reject) => {
            const form = new IncomingForm();

            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                resolve({fields, files});
            });
        });
        console.log(data);
        const file = data?.files?.inputFile;
        const title = data?.fields?.title;
        const content = data?.fields?.content;
        const email = data?.fields?.email;

        // upload to post to prisma
        let prismaId = -1;
        const result = await prisma.post.create({
            data: {
                title: title,
                content: content,
                author: {connect: {email: email}},
            },
        });
        prismaId = result.id;
        console.log(`Created post: ${result.title} (ID: ${result.id})`);
        responseJsonObj["prisma"] = result;


        const uniquePublicId = `${file.originalFilename}-${Date.now()}`;
        let videoUrl = "";
        // upload to cloudinary
        try {
            const response = await cloudinary.v2.uploader.upload(file.filepath, {
                resource_type: "video",
                public_id: uniquePublicId,
            });
            videoUrl = response.secure_url;
            console.log("successful upload to cloudinary");
            console.log(response);
        } catch (error) {
            console.log("Error", error);
            responseJsonObj["cloudinary"] = error;
        }

        // upload to mongodb
        try {
            await client.connect();
            const database = client.db("blog");
            const collection = database.collection("videos");
            const result = await collection.insertOne({
                prisma_id: prismaId,
                public_id: uniquePublicId,
                url: videoUrl,
            });
            console.log(`result: ${result}`);
        } catch (error) {
            console.log("Error", error);
            responseJsonObj["mongo"] = error;
        }

        // send response
        res.json(responseJsonObj);
    }
}

// this line is unsecured
//export default handle;
export default csrf(handle);
