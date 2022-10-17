
import AsyncStorage from '@react-native-async-storage/async-storage';
const Environment = require('./environments');

export const logout = async () => {
    try {
        await AsyncStorage.removeItem('user');
    } catch (e) {
        console.log('Error logging out');
    }
}


export const checkAuth = async () => {
    try {
        let res = JSON.parse(await AsyncStorage.getItem('user'));
        if (res == null) {
            return false;
        }
        let auth = await fetch(Environment.HOST + '/authorize/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${res.jwt}`
            }
        }).then((response) => {
            if (response.status !== 200) {
                return false;
            }
            return response.json().then(function (data) {
                console.log("response ", data);
                if (data == 1) {
                    return true;
                }
                return false;
            });
        }).catch((err) => {
            return false;
        });
        return auth;
    } catch (e) {
        console.log('Error checking auth.');
    }
    return false;
}

export const getJWT = async () => {
    try {
        let res = JSON.parse(await AsyncStorage.getItem('user'));
        if (res == null || res == undefined) {
            return false;
        }
        return res.jwt;
    } catch (e) {
        console.log('Error getting jwt.');
    }
    return false;
}

export const getUser = async () => {
    try {
        let res = JSON.parse(await AsyncStorage.getItem('user'));
        if (res == null || res == undefined) {
            return false;
        }
        return res.user;
    } catch (e) {
        console.log('Error getting user.');
    }
    return false;
}