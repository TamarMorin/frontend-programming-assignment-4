import React from "react";
import {GetServerSideProps} from "next";
import Layout from "../components/Layout";
import Post, {PostProps} from "../components/Post";
import prisma from '../lib/prisma'
import {MongoClient, ServerApiVersion} from "mongodb";
const jwt = require("jsonwebtoken");
import Cookies from 'universal-cookie';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
    const cookies = new Cookies(req.cookies);
    let username = null;
    jwt.verify(cookies.get("token"), process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return null;
        }
        username = decoded.username;
    });

    const drafts = await prisma.post.findMany({
        where: {
            author: {email: username}, // TODO: replace with real email or decide what we wanna do here
            published: false,
        },
        include: {
            author: {
                select: {name: true},
            },
        },
    });

    // add hasVideo property to each post for bonus 2
    for (let i = 0; i < drafts.length; i++) {
        await client.connect();
        const database = client.db("blog");
        const collection = database.collection("videos");
        const result = await collection.findOne({
            prisma_id: drafts[i].id,
        });
        drafts[i] = Object.assign({}, drafts[i], {videoUrl: result?.url ?? null})
    }

    return {
        props: {
            drafts,
            header: {
                username: username,
            },
        },
    };
};

type Props = {
    drafts: PostProps[];
    header: {
        username: string;
    };
};

const Drafts: React.FC<Props> = (props) => {

    return (
        <Layout header={props.header}>
            <div className="page">
                <h1>My Drafts</h1>
                <main>
                    {props.drafts.map((post) => (
                        <div key={post.id} className="post">
                            <Post post={post}/>
                        </div>
                    ))}
                </main>
            </div>
            <style jsx>{`
              .post {
                background: white;
                transition: box-shadow 0.1s ease-in;
              }

              .post:hover {
                box-shadow: 1px 1px 3px #aaa;
              }

              .post + .post {
                margin-top: 2rem;
              }
            `}</style>
        </Layout>
    );
};

export default Drafts;
