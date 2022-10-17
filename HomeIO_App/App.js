import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { checkAuth, getJWT } from './auth';
import { LoggedInRoutes, LoggedOutRoutes } from './router';
import SplashScreen from './src/screens/SplashScreen';

export default () => {

  const [isReady, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  const runAuthCheck = () => {
    checkAuth()
      .then((res) => {
        console.log("res ", res);
        if (res) {
          getJWT().then(jwt => {
            setToken(jwt);
            setLoggedIn(true);
            setReady(true);
          })
        } else {
          setLoggedIn(false);
          setReady(true);
        }
      })
      .catch((err) => {
        setLoggedIn(false);
        setReady(true);
      });
  }

  useEffect(() => {
    runAuthCheck();
  }, []);

  if (!isReady) {
    return (
      <SplashScreen />
    );
  }

  return (
    loggedIn ? <LoggedInRoutes jwtToken={token} runAuthCheck={runAuthCheck} /> : <LoggedOutRoutes runAuthCheck={runAuthCheck} />
  );
}
