import React from "react";
import {PostProps} from "../components/Post";
import Layout from "../components/Layout";
import Image from "next/image";
import {GetServerSideProps} from "next";
import Cookies from "universal-cookie";
import prisma from "../lib/prisma";
const jwt = require("jsonwebtoken");

export const getServerSideProps: GetServerSideProps = async (context) => {
    const cookies = new Cookies(context.req.cookies);
    let username = undefined;
    let email = undefined;
    jwt.verify(cookies.get("token"), process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return null;
        }
        username = decoded.username;
        email = decoded.email;
    });

    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    return {
        props: {
            id: user?.id,
            username: user?.name,
            email: user?.email,
            image: user?.image,
        }
    };
};

type ProfileProps = {
    id: string;
    username: string;
    email: string;
    image: string;
}


const Profile: React.FC<ProfileProps> = (props) => {
    const header = {
        username: props.username,
        email: props.email,
    }
    return (
        <Layout header={header}>
            <div>
                <h1>{props.username}</h1>
                <h1>{props.email}</h1>
                <Image src={props.image} alt={"profile image"} width={200} height={200}/>
            </div>
        </Layout>
    );
}

export default Profile;