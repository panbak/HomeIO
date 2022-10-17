import { useState, useEffect } from 'react';
import App from './App';
import Login from './Login';
import authenticate from './authenticate';

const Authenticator = () => {
    const [isAuth, setAuth] = useState(false);
    useEffect(() => {
        authenticate().then((res) => {
            setAuth(res);
        })
    });
    return (
        <>
            {
                isAuth ? <App /> : <Login />
            }
        </>
    );
}
export default Authenticator;