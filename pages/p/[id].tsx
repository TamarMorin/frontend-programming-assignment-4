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

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


export const getServerSideProps: GetServerSideProps = async ({params}) => {
    const post = await prisma.post.findUnique({
        where: {
            id: Number(params?.id) || -1,
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
        console.log(`result: ${result?.url}`);
    } catch (error) {
        console.log("Error", error);
    }

    return {
        props: Object.assign({}, post, {videoUrl: videoUrl}) ?? {author: {name: "Me"}},
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
    const {data: session, status} = useSession();
    const userHasValidSession = Boolean(session);
    const postBelongsToUser = session?.user?.email === props.author?.email;
    let title = props.title;
    if (!props.published) {
        title = `${title} (Draft)`;
    }

    return (
        <Layout>
            <div>
                <h2>{title}</h2>
                <p>By {props?.author?.name || "Unknown author"}</p>
                <ReactMarkdown children={props.content}/>
                {props.videoUrl && <Video videoUrl={props.videoUrl}/>}
                <br/>
                <br/>
                {!props.published && userHasValidSession && postBelongsToUser && (
                    <button onClick={() => publishPost(props.id)}>Publish</button>
                )}
                {userHasValidSession && postBelongsToUser && (
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
