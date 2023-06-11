import React, {useRef, useState} from "react";
import Layout from "../components/Layout";
import Router from "next/router";
import {Spinner} from "../components/Spinner";
import {GetServerSideProps} from "next";
import Cookies from "universal-cookie";
const jwt = require("jsonwebtoken");

export const getServerSideProps: GetServerSideProps = async (context) => {
    const {req, res} = context;
    const cookies = new Cookies(req.cookies);
    let username = null;
    let email = null;
    jwt.verify(cookies.get("token"), process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return null;
        }
        username = decoded.username;
        email = decoded.email;

    });

    return {
        props: {
            header: {
                username: username,
                email: email,
            }
        }
    }
}

type Props = {
    header: {
        username: string;
        email: string;
    }
}

const Draft: React.FC<Props> = (props: Props) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [video, setVideo] = useState(null);
    const [showSpinner, setShowSpinner] = useState(false);
    const inputRef = useRef(null);


    let email = props.header.email;
    const submitData = async (e: React.SyntheticEvent) => {
        setShowSpinner(true);
        e.preventDefault();
        const formData = new FormData();
        formData.append("inputFile", video);
        formData.append("title", title);
        formData.append("content", content);
        formData.append("email", email);
        try {
            await fetch(`/api/post`, {
                method: "POST",
                body: formData,
            });
            // setShowSpinner(false);
            await Router.push("/drafts");
        } catch (error) {
            setShowSpinner(false);
            console.error(error);
        }
    };

    return (
        <Layout header={props.header}>
            <div>
                {showSpinner && <Spinner displayed={showSpinner}/>}
                {!showSpinner && <form onSubmit={submitData}>
                    <h1>New Draft</h1>
                    <input
                        autoFocus
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        type="text"
                        value={title}
                    />
                    <textarea
                        cols={50}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Content"
                        rows={8}
                        value={content}
                    />
                    <span className="mt-2 text-base text-black leading-normal">Select a video</span>
                    <input type="file"
                           ref={inputRef}
                           onChange={(e) => setVideo(e.target.files[0])}
                           className="hidden form-control form-control-sm p-3 mb-2 bg-white text-dark"/>
                    <button type="button" onClick={() => {
                        if (inputRef.current != null) {
                            inputRef.current.value = null;
                        }
                    }}>Reset file
                    </button>
                    <br/>
                    <input disabled={!content || !title} type="submit" value="Create"/>
                    <a className="back" href="#" onClick={() => Router.push("/")}>
                        or Cancel
                    </a>
                </form>
                }
            </div>
            <style jsx>{`
              .page {
                background: white;
                padding: 3rem;
                display: flex;
                justify-content: center;
                align-items: center;
              }

              input[type="text"],
              textarea {
                width: 100%;
                padding: 0.5rem;
                margin: 0.5rem 0;
                border-radius: 0.25rem;
                border: 0.125rem solid rgba(0, 0, 0, 0.2);
              }

              input[type="submit"] {
                background: #ececec;
                border: 0;
                padding: 1rem 2rem;
              }

              .back {
                margin-left: 1rem;
              }
            `}</style>
        </Layout>
    );
};

export default Draft;
