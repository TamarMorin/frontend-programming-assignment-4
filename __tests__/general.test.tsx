import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import Pagination, {PaginationProps} from "../components/Pagination";
import {useRouter} from "next/router";
import Header from "../components/Header";
import {Spinner} from "../components/Spinner";
import {Video} from "../components/Video";
import Profile from "../pages/profile";

jest.mock('next/router', () => ({
    useRouter: jest.fn()
}));

describe('renders pagination component correctly', () => {
    (useRouter as jest.Mock).mockReturnValue({
        push: jest.fn(),
    });
    test('should render', function () {
        const props: PaginationProps = {
            currentPage: 2,
            totalPages: 5,
        };
        render(<Pagination {...props}/>);
    });

});

describe('renders blog component correctly', () => {
    test('should render', function () {
        render(<Header header={{username: "test", email: "test@test.com"}}/>);
    });
});

describe('renders spinner component correctly', () => {
    test('should render', function () {
        render(<Spinner displayed={true}/>);
    });
});

describe('renders video component correctly', () => {
    test('should render', function () {
        render(<Video videoUrl={"https://test"}/>);
    });
});

describe('renders Profile component correctly', () => {
    test('should render', function () {
        render(<Profile id={"test"} username={"Test"} email={"test@test"} image={""}/>);
    });
});
