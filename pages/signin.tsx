import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Router from "next/router";
const jwt = require('jsonwebtoken')

const Login: React.FC = () => {
    const [authMode, setAuthMode] = useState("signin");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmitSignin = async (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        // Perform login logic using credentials.username and credentials.password
        // For simplicity, we'll just log the credentials to the console
        try {
            const body = JSON.stringify({
                username: username,
                password: password,
            });
            const res = await fetch(`/api/signin`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: body,
            });
            if (res.status === 200) {
                // set token
                const {token} = await res.json();
                // set cookie
                document.cookie = `token=${token};`;

                await Router.push("/");
            } else {
                console.error("Login failed.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmitSignup = async (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        // Perform login logic using credentials.username and credentials.password
        // For simplicity, we'll just log the credentials to the console
        try {
            const body = JSON.stringify({
                username: username,
                password: password,
            });
            const res = await fetch(`/api/signup`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: body,
            });
            if (res.status === 200) {
                await Router.push("/signin");
            } else {
                alert("Signup failed.");
                console.error(`Signup failed. HTTP status = ${res.status} ${res.statusText} ${res.message}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const changeAuthMode = () => {
        setAuthMode(authMode === "signin" ? "signup" : "signin");
        setUsername("");
        setPassword("");
    }

    if (authMode === "signin") {
        return (
            <div className="Auth-form-container">
                <form className="Auth-form" onSubmit={handleSubmitSignin}>
                    <div className="Auth-form-content">
                        <h3 className="Auth-form-title">Sign In</h3>
                        <div className="text-center">
                            Not registered yet?{" "}
                            <span className="link-primary" onClick={changeAuthMode}>
                Sign Up
              </span>
                        </div>
                        <div className="form-group mt-3">
                            <label>Username</label>
                            <input
                                type="text"
                                onChange={(e) => setUsername(e.target.value)}
                                className="form-control mt-1"
                                placeholder="Enter username"
                            />
                        </div>
                        <div className="form-group mt-3">
                            <label>Password</label>
                            <input
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-control mt-1"
                                placeholder="Enter password"
                            />
                        </div>
                        <div className="d-grid gap-2 mt-3">
                            <button type="submit" className="btn btn-primary">
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div className="Auth-form-container">
            <form className="Auth-form" onSubmit={handleSubmitSignup}>
                <div className="Auth-form-content">
                    <h3 className="Auth-form-title">Sign Up</h3>
                    <div className="text-center">
                        Already registered?{" "}
                        <span className="link-primary" onClick={changeAuthMode}>
              Sign In
            </span>
                    </div>
                    <div className="form-group mt-3">
                        <label>Username</label>
                        <input
                            type="text"
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-control mt-1"
                            placeholder="Enter username"
                        />
                    </div>
                    <div className="form-group mt-3">
                        <label>Password</label>
                        <input
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-control mt-1"
                            placeholder="Enter password"
                        />
                    </div>
                    <div className="d-grid gap-2 mt-3">
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
};

export default Login;