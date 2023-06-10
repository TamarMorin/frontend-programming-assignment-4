import React, { createContext, useEffect, useState } from "react";
import Link from "next/link";
import {useRouter} from "next/router";
import {signOut} from "next-auth/react";
import Cookies from "universal-cookie";
const jwt = require('jsonwebtoken')

const cookies = new Cookies();

const Header: React.FC = () => {
    const [session, setSession] = useState<{token: string, username: string, name: string}>()
    
    useEffect(() => {
      const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
      if (loggedUserJSON) {
        setSession(JSON.parse(loggedUserJSON))
        if(session)
          console.log("user is logged11 in:  " +session.name)
      }
    }, [])

    const logout = () => {
      window.localStorage.removeItem('loggedNoteappUser');
      setSession(undefined);
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

    if (!session) {
        right = (
            <div className="right">
                <Link href="/signin">User & Password Log in</Link>
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

    if (session) {
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
                    {session.username}
                    {/*{session.username}  {session.user.email}*/}
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

