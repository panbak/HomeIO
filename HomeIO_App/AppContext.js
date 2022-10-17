import React, { useState } from 'react';
import { getJWT } from './auth';

export const AppContext = React.createContext(null);

export const ContextWrapper = (props) => {


    const [store, setStore] = useState({
        jwt: props.jwtToken
    });
    const [actions, setActions] = useState({
        setJWT: jwt => setStore({ ...store, jwt: jwt })
    });

    return (
        <AppContext.Provider value={{ store, actions }}>
            {props.children}
        </AppContext.Provider>
    );
}