import React from "react";
import {GetServerSideProps} from "next";
import Layout from "../components/Layout";
import Post, {PostProps} from "../components/Post";
import {useSession, getSession} from "next-auth/react";
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

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
    const session = await getSession({req});
    if (!session) {
        res.statusCode = 403;
        return {props: {drafts: []}};
    }

    const drafts = await prisma.post.findMany({
        where: {
            author: {email: session.user?.email},
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
        props: {drafts},
    };
};

type Props = {
    drafts: PostProps[];
    numberOfPages: number;
    pageNumber: number;
};

const Drafts: React.FC<Props> = (props) => {
    const {data: session} = useSession();

    if (!session) {
        return (
            <Layout>
                <h1>My Drafts</h1>
                <div>You need to be authenticated to view this page.</div>
            </Layout>
        );
    }

    return (
        <Layout>
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
