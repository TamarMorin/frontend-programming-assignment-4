import {GetServerSideProps} from "next";
import prisma from "../../lib/prisma";
import Blog, {PAGE_SIZE} from "../index";
import React from "react";
import Post, {PostProps} from "../../components/Post";
import Cookies from "universal-cookie";
const jwt = require("jsonwebtoken");

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

    const pageNumber = Number(context.params?.pageNumber) || 0
    const numberOfPages = Math.ceil(await prisma.post.count({
        where: {
            published: true,
        }
    }) / PAGE_SIZE);

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

    return {
        props: {
            feed,
            numberOfPages,
            pageNumber,
            header: {
                username: username,
                email: email,
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

const Page: React.FC<Props> = (props) => {
    return (<Blog header={props.header} key={`blog-page-${props.pageNumber}`} feed={props.feed} pageNumber={props.pageNumber}
                  numberOfPages={props.numberOfPages}/>);
}
export default Page;
