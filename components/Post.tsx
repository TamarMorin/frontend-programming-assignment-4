import React from "react";
import Router from "next/router";
import ReactMarkdown from "react-markdown";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faVideo} from '@fortawesome/free-solid-svg-icons'

export type PostProps = {
    id: number;
    title: string;
    author: {
        name: string;
        email: string;
    } | null;
    content: string;
    published: boolean;
    videoUrl: string;
    header: {
        username: string;
        email: string;
    }
};

const Post: React.FC<{ post: PostProps }> = ({post}) => {
    const authorName = post.author ? post.author.name : "Unknown author";

    return (
        <div onClick={() => Router.push("/p/[id]", `/p/${post.id}`)}>
            <h2>{post.title}</h2>
            <small>By {authorName}</small>
            <ReactMarkdown children={post.content}/>
            {post.videoUrl != null && <FontAwesomeIcon icon={faVideo}/>}
            <br/>
            <style jsx>{`
              div {
                color: inherit;
                padding: 2rem;
              }
            `}</style>
        </div>
    );
};

export default Post;