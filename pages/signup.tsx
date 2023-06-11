import React, {useRef, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Router from "next/router";


const Signup: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [image, setImage] = useState(null);
    const inputRef = useRef(null);

    const handleSubmitSignup = async (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        // Perform login logic using credentials.username and credentials.password
        // For simplicity, we'll just log the credentials to the console
        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);
            formData.append("email", email);
            formData.append("image", image);

            const res = await fetch(`/api/signup`, {
                method: "POST",
                body: formData,
            });

            if (res.status === 200) {
                await Router.push("/login");
            } else {
                alert(`Signup failed. ${JSON.stringify(res)}`);
                console.error(`Signup failed. HTTP status = ${res.status} ${res.statusText} ${res}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="Auth-form-container">
            <form className="Auth-form" onSubmit={handleSubmitSignup}>
                <div className="Auth-form-content">
                    <h3 className="Auth-form-title">Sign Up</h3>
                    <div className="text-center">
                        Already registered?{" "}
                        <span className="link-primary" onClick={ () => Router.push("/login")}>
              Log In
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
                        <label>Email</label>
                        <input
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control mt-1"
                            placeholder="Enter email"
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
                    <div className="form-group mt-3">
                        <label>Profile Picture</label>
                        <input type="file"
                               ref={inputRef}
                               onChange={(e) => setImage(e.target.files[0])}
                               className="hidden form-control form-control-sm p-3 mb-2 bg-white text-dark"/>
                        <button type="button" onClick={() => {
                            if (inputRef.current != null) {
                                inputRef.current.value = null;
                            }
                        }}>Reset image
                        </button>
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

export default Signup;