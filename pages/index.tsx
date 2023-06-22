import React from "react";
import type {GetServerSideProps} from "next";
import Layout from "../components/Layout";
import Post, {PostProps} from "../components/Post";
import prisma from '../lib/prisma'
import {MongoClient, ServerApiVersion} from "mongodb";
import 'bootstrap/dist/css/bootstrap.min.css';
import Pagination, {PaginationProps} from "../components/Pagination";
import Cookies from "universal-cookie";

const jwt = require("jsonwebtoken");

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

export const PAGE_SIZE: number = 10;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const cookies = new Cookies(context.req.cookies);
    let username = null;
    let email = null;
    jwt.verify(cookies.get("token"), process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return null;
        }
        username = decoded.username;
        email = decoded.email;
    });

    const numberOfPages = Math.ceil(await prisma.post.count({
        where: {
            published: true,
        }
    }) / PAGE_SIZE);

    let pageNumber = Number(context.query?.pageNumber)
    if (typeof pageNumber == undefined || typeof pageNumber == null || isNaN(pageNumber) || pageNumber < 0 || pageNumber >= numberOfPages) {
        pageNumber = 0;
    }

    const feed = await prisma.post.findMany({
        skip: PAGE_SIZE * pageNumber,
        take: PAGE_SIZE,
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

        // find image url
        const user = await prisma.user.findUnique({
            where: {
                id: feed[i].authorId ?? 0,
            }
        });

        feed[i] = Object.assign({}, feed[i], {videoUrl: result?.url ?? null, profileImageUrl: user?.image})
    }

    return {
        props: {
            feed,
            numberOfPages,
            pageNumber,
            header: {
                username: username,
                email: email
            }
        },
    };
};

type Props = {
    feed: PostProps[];
    numberOfPages: number;
    pageNumber: number;
    header: {
        username: string;
        email: string;
    }
};


const Blog: React.FC<Props> = (props) => {
    return (
        <Layout header={props.header}>
            <div className="page">
                <h1>Public Feed</h1>
                <main>
                    {props.feed.map((post) => (
                        <div key={post.id} className="post">
                            <Post post={post}/>
                        </div>
                    ))}
                </main>
                <Pagination key="pagination" currentPage={props.pageNumber} totalPages={props.numberOfPages}/>
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
