import Link from "next/link";
import Router, {useRouter} from "next/router";
import Cookies from "universal-cookie";
const jwt = require('jsonwebtoken');


// add server side props to get session from cookie
export type HeaderProps = {
    username: string;
    email: string;
};


function signOut() {
    const cookies = new Cookies();
    cookies.remove("token");
    Router.push("/login");
}

const Header: React.FC<{header: HeaderProps}> = ({header}) => {
    // simple manipulation to get similar session variable out of token decoded
    let session = {
        user : {
            name: header.username,
            email: header.email
        }
    }

    const router = useRouter();
    const isActive: (pathname: string) => boolean = (pathname) =>
        router.pathname === pathname;

    let left = (
        <div className="left">
            <Link href="/" legacyBehavior>
                <a className="bold" data-active={isActive("/")}>
                    Feed
                </a>
            </Link>
            <style jsx>{`
        .bold {
          font-weight: bold;
        }

        a {
          text-decoration: none;
          color: #000;
          display: inline-block;
        }

        .left a[data-active="true"] {
          color: gray;
        }

        a + a {
          margin-left: 1rem;
        }
      `}</style>
        </div>
    );

    let right = null;

    // if (!session) {
    if (session.user.name === null) {
        right = (
            <div className="right">
                <Link href="/login" legacyBehavior>
                    <a className="bold" data-active={isActive("/")}>
                        User & Password Log in
                    </a>
                </Link>
                <style jsx>{`
          a {
            text-decoration: none;
            color: #000;
            display: inline-block;
          }

          a + a {
            margin-left: 1rem;
          }

          .right {
            margin-left: auto;
          }

          .right a {
            border: 1px solid black;
            padding: 0.5rem 1rem;
            border-radius: 3px;
          }
        `}</style>
            </div>
        );
    }

    // if (session) {
    if (session.user.name !== null) {
        left = (
            <div className="left">
                <Link href="/" legacyBehavior>
                    <a className="bold" data-active={isActive("/")}>
                        Feed
                    </a>
                </Link>
                <Link href="/drafts" legacyBehavior>
                    <a data-active={isActive("/drafts")}>My drafts</a>
                </Link>
                <style jsx>{`
          .bold {
            font-weight: bold;
          }

          a {
            text-decoration: none;
            color: #000;
            display: inline-block;
          }

          .left a[data-active="true"] {
            color: gray;
          }

          a + a {
            margin-left: 1rem;
          }
        `}</style>
            </div>
        );
        right = (
            <div className="right">
                <p>
                    {session.user.name}  {session.user.email}
                </p>
                <Link href="/create" legacyBehavior>
                    <button>
                        <a>New post</a>
                    </button>
                </Link>
                <button onClick={() => signOut()}>
                    <a>Log out</a>
                </button>
                <style jsx>{`
          a {
            text-decoration: none;
            color: #000;
            display: inline-block;
          }

          p {
            display: inline-block;
            font-size: 13px;
            padding-right: 1rem;
          }

          a + a {
            margin-left: 1rem;
          }

          .right {
            margin-left: auto;
          }

          .right a {
            border: 1px solid black;
            padding: 0.5rem 1rem;
            border-radius: 3px;
          }

          button {
            border: none;
          }
        `}</style>
            </div>
        );
    }

    return (
        <nav>
            {left}
            {right}
            <style jsx>{`
        nav {
          display: flex;
          padding: 2rem;
          align-items: center;
        }
      `}</style>
        </nav>
    );
};

export default Header;

