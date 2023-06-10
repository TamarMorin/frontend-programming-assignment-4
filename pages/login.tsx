import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Router from "next/router";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmitLogin = async (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        // Perform login logic using credentials.username and credentials.password
        // For simplicity, we'll just log the credentials to the console
        try {
            const body = JSON.stringify({
                username: username,
                password: password,
            });
            const res = await fetch(`/api/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: body,
            });
            if (res.status === 200) {
                // set token
                const {token} = await res.json();
                // set cookie
                cookies.set('token', token);
                console.log(`success! token: ${token}`)
                await Router.push("/");
            } else {
                console.log(`failed! res: ${JSON.stringify(res)}`);
                alert("Login failed.");
                console.error("Login failed.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="Auth-form-container">
            <form className="Auth-form" onSubmit={handleSubmitLogin}>
                <div className="Auth-form-content">
                    <h3 className="Auth-form-title">Log In</h3>
                    <div className="text-center">
                        Not registered yet?{" "}
                        <span className="link-primary" onClick={() => Router.push("/signup")}>
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
    );
}

export default Login;