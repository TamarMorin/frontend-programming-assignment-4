import {GetServerSideProps} from "next";
import prisma from "../../lib/prisma";
import Blog, {PAGE_SIZE} from "../index";
import React from "react";
import Post, {PostProps} from "../../components/Post";
import Pagination, {PaginationProps} from "../../components/Pagination";

export const getServerSideProps: GetServerSideProps = async ({params}) => {
    const pageNumber = Number(params?.pageNumber) || 0
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
        },
    };
};

type Props = {
    feed: PostProps[];
    numberOfPages: number;
    pageNumber: number;
};

const Page: React.FC<Props> = (props) => {
    return (<Blog key={`blog-page-${props.pageNumber}`} feed={props.feed} pageNumber={props.pageNumber}
                  numberOfPages={props.numberOfPages}/>);
}
export default Page;
