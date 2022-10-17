import axios from 'axios';
import React, { useState } from 'react';
import './App.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const config = require('./config');

    const login = async () => {
        let auth = await axios.post(`${config.SERVER_BASE_URL}/users/login`, {
            email: email,
            password: password
        }).then((response) => {
            console.log(response.data);
            if (response.status !== 200) {
                response.json().then(function (data) {
                    setError(true);
                });
                return false;
            } else {
                window.localStorage.setItem('user', JSON.stringify(response.data));
                console.log(window.localStorage.getItem('user'));
                setError(false);
                return true;
            }
        }).catch((err) => {
            setError(true);
        });
        if (auth) {
            setError(false);
            window.location.reload();
        }
    }

    return (
        <div className="flex flex-col mt-24">
            <span className="text-2xl font-bold mx-auto">Σύνδεση</span>
            <div className="w-10/12 md:w-1/3 mx-auto">
                <div className="mt-5 grid grid-cols-1 gap-10">
                    <input type="text" className="rounded bg-gray-200 p-2" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
                    <input type="password" className="rounded bg-gray-200 p-2" placeholder="κωδικός" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="mt-16 text-center">
                    <button className="rounded bg-custom-blue px-4 py-2 font-bold" onClick={login}>Σύνδεση</button>
                </div>
            </div>
            {
                error ?
                    <div className="w-10/12 md:w-1/3 mx-auto text-center bg-red-300 text-red-900 rounded py-2 mt-4 shadow">
                        Login failed.
                    </div>
                    :
                    null
            }
        </div>
    );
}

export default Login;