import type {NextApiRequest, NextApiResponse} from 'next'
import prisma from '../../../lib/prisma'


import {MongoClient, ServerApiVersion} from "mongodb";
import cloudinary from "cloudinary";
const jwt = require("jsonwebtoken");
import Cookies from "universal-cookie";

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


// DELETE /api/post/:id
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const postId = req.query.id;
    const cookies = new Cookies();
    const session = jwt.decode(cookies.get("token"))

    if (req.method === "DELETE") {
        let responseJsonObj = {};
        if (session) {
            const post = await prisma.post.delete({
                where: {id: Number(postId)},
            });
            responseJsonObj["prisma"] = post;
            //res.json(post);

            // delete from mongodb
            let publicId;
            try {
                await client.connect();
                const database = client.db("blog");
                const videos = database.collection("videos");
                console.log(`about to delete from mongo post.id is ${post.id}`);
                const result = await videos.findOneAndDelete({"prisma_id": post.id});
                console.log(`result is ${result}`);
                console.log(JSON.stringify(result));
                publicId = result.value?.public_id;
                console.log(`publicId is ${publicId}`);
                responseJsonObj["mongodb"] = result;
            } catch (error) {
                console.log("Error delete mongodb", error);
                responseJsonObj["mongodb"] = error;
            }

            // delete from cloudinary
            try {
                const response = await cloudinary.v2.uploader.destroy(publicId, {resource_type: "video"});
                console.log(response);
                responseJsonObj["cloudinary"] = response;
            }
            catch (error) {
                console.log("Error delete cloudinary", error);
                responseJsonObj["cloudinary"] = error;
            }

            // send response
            res.json(responseJsonObj);
        } else {
            res.status(401).send({message: 'Unauthorized'})
        }
    } else {
        throw new Error(
            `The HTTP ${req.method} method is not supported at this route.`
        );
    }
}
