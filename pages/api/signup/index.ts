import {NextApiRequest, NextApiResponse} from "next";
import {MongoClient, ServerApiVersion} from "mongodb";
import cloudinary from "cloudinary";
import {IncomingForm} from "formidable";

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

export const config = {
    api: {
        bodyParser: false
    }
};


// Handle any requests to /api/singup
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    console.log(req.body);
    if (req.method == 'POST') {
        const saltRounds = 10;
        const data = await new Promise((resolve, reject) => {
            const form = new IncomingForm();

            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                resolve({fields, files});
            });
        });

        const image = data?.files?.image;
        const username = data?.fields?.username;
        let password = data?.fields?.password;
        const email = data?.fields?.email;
        const fullName = data?.fields?.fullName;

        console.log(username);

        if (username === "" || password === "" || email === "" || fullName === "") {
            console.log(`Username or password or email or name is empty ${username} ${password}`);
            res.status(400).json({message: `Error signup user ${username}, username or password is empty`});
        }

        const passwordHash = await bcrypt.hash(password, saltRounds)

        console.log(passwordHash);

        // upload to mongodb
        try {
            await client.connect();
            const database = client.db('blog');
            const collection = database.collection('users');

            console.log("connection");


            // check if user already exists
            const resultExist = await collection.findOne({username: username, email: email});
            if (resultExist != null) {
                console.log(`Username already exists ${JSON.stringify(resultExist)}`);
                return res.status(400).json({message: `Error signup user ${username}, user already exists`});
            }

            console.log("resultexist");

            const result = await collection.insertOne({
                username: username,
                fullName: fullName,
                password: passwordHash,
                email: email,
                image: image
            });

            console.log("result");

            // check if result is successful
            if (result.insertedId == null) {
                console.log("Error", result);
                return res.status(500).json({message: `Error signup user ${username}`});
            }

            let imageUrl = "";

            if(image){
                // upload image to cloudinary, save imageUrl in prisma db (not like video url which is saved in mongodb)
                // only because we already have image attribute in prisma db
                const uniquePublicId = `${image.originalFilename}-${Date.now()}`;
                // upload to cloudinary
                try {
                    const response = await cloudinary.v2.uploader.upload(image.filepath, {
                        resource_type: "image",
                        public_id: uniquePublicId,
                    });
                    imageUrl = response.secure_url;
                    console.log("successful uploaded profile image to cloudinary");
                    console.log(response);
                } catch (error) {
                    console.log("Error upload profile image to cloudinary", error);
                    return res.status(500).json({message: `Error upload profile image to cloudinary user ${username}, ${error}`});
                }
            }


            // create same user in prisma
            console.log(`Creating user with username: ${username} and email: ${email} in prisma db`);
            try {
                const user = await prisma.user.create({
                    data: {
                        name: username,
                        fullName: fullName,
                        email: email,
                        image: imageUrl,
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
            console.log("it failes here");
            return res.status(500).json({message: `Error signup user ${username}, ${error}`});
        }

    }
}