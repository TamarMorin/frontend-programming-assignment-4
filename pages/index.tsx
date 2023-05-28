import React from "react";
import type {GetServerSideProps} from "next";
import Layout from "../components/Layout";
import Post, {PostProps} from "../components/Post";
import prisma from '../lib/prisma'
import {MongoClient, ServerApiVersion} from "mongodb";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

export const getServerSideProps: GetServerSideProps = async () => {
    const feed = await prisma.post.findMany({
        where: {
            published: true,
        },
        include: {
            author: {
                select: {
                    name: true,
                },
            },
        },
    });

    // add hasVideo property to each post for bonus 2
    for (let i = 0; i < feed.length; i++) {
        await client.connect();
        const database = client.db("blog");
        const collection = database.collection("videos");
        const result = await collection.findOne({
            prisma_id: feed[i].id,
        });
        feed[i] = Object.assign({}, feed[i], {videoUrl: result?.url ?? null})
    }

    return {
        props: {
            feed
        },
    };
};

type Props = {
    feed: PostProps[];
};

const Blog: React.FC<Props> = (props) => {
    return (
        <Layout>
            <div className="page">
                <h1>Public Feed</h1>
                <main>
                    {props.feed.map((post) => (
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

export default Blog;
