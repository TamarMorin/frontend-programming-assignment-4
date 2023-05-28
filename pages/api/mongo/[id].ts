import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react';
import {MongoClient, ServerApiVersion} from "mongodb";
require('dotenv').config();

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req })
    console.log(`inside mongo req.method is ${req.method}`);
    if (req.method === "GET") {
        const postId = req.query.id;
        console.log(`inside mongo/[id].ts postId: ${postId}`);
        if (session) {
            try {
                await client.connect();
                const database = client.db("blog");
                const collection = database.collection("videos");
                const result = await collection.findOne({
                    prisma_id: postId,
                });
                if (result) {
                    res.json(result.video_url);
                }
                console.log(`result: ${result?.video_url}`);
                res.json(null);
            } catch (error) {
                console.log("Error", error);
                res.json(error);
            }
        } else {
            res.status(401).send({ message: 'Unauthorized' })
        }
    } else {
        throw new Error(`The HTTP ${req.method} method is not supported at this route.`);
    }
}
