import React from "react";
import {GetServerSideProps} from "next";
import ReactMarkdown from "react-markdown";
import Layout from "../../components/Layout";
import Router from "next/router";
import {PostProps} from "../../components/Post";
import prisma from '../../lib/prisma'
import {useSession} from "next-auth/react";
import {Video} from "../../components/Video";
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


export const getServerSideProps: GetServerSideProps = async (context) => {

    const cookies = new Cookies(context.req.cookies);
    let username = null;
    jwt.verify(cookies.get("token"), process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return null;
        }
        username = decoded.username;
    });

    const post = await prisma.post.findUnique({
        where: {
            id: Number(context.params?.id) || -1,
        },
        include: {
            author: {
                select: {name: true, email: true},
            },
        },
    });
    let videoUrl = null;
    try {
        await client.connect();
        const database = client.db("blog");
        const collection = database.collection("videos");
        const result = await collection.findOne({
            prisma_id: post?.id,
        });
        if (result) {
            videoUrl = result.url;
        }
        console.log(`result url: ${result?.url}`);
    } catch (error) {
        console.log("Error", error);
    }

    return {
        props: Object.assign({}, post, {videoUrl: videoUrl, header: {username: username}}) ?? {author: {name: "Me"}},
    };
};

async function publishPost(id: number): Promise<void> {
    await fetch(`/api/publish/${id}`, {
        method: "PUT",
    });
    await Router.push("/")
}

async function deletePost(id: number): Promise<void> {
    await fetch(`/api/post/${id}`, {
        method: "DELETE",
    });
    await Router.push("/")
}


const Post: React.FC<PostProps> = (props) => {
    console.log(`inside /api/p/${props.id}`);

    console.log(`props: ${JSON.stringify(props)}`);

    const postBelongsToUser = props.header.username === props.author?.email;
    let title = props.title;
    if (!props.published) {
        title = `${title} (Draft)`;
    }

    return (
        <Layout header={props.header}>
            <div>
                <h2>{title}</h2>
                <p>By {props?.author?.name || "Unknown author"}</p>
                <ReactMarkdown children={props.content}/>
                {props.videoUrl && <Video videoUrl={props.videoUrl}/>}
                <br/>
                <br/>
                {!props.published && postBelongsToUser && (
                    <button onClick={() => publishPost(props.id)}>Publish</button>
                )}
                {postBelongsToUser && (
                    <button onClick={() => deletePost(props.id)}>Delete</button>
                )}
            </div>
            <style jsx>{`
              .page {
                background: white;
                padding: 2rem;
              }

              .actions {
                margin-top: 2rem;
              }

              button {
                background: #ececec;
                border: 0;
                border-radius: 0.125rem;
                padding: 1rem 2rem;
              }

              button + button {
                margin-left: 1rem;
              }
            `}</style>
        </Layout>
    );
};

export default Post;
