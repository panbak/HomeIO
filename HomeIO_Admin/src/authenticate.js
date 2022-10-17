const config = require('./config');
const authenticate = async () => {
    if (!window.localStorage.getItem('user')) {
        return false;
    }
    let jwt = JSON.parse(window.localStorage.getItem('user')).jwt;
    let auth = await fetch(`${config.SERVER_BASE_URL}/authorize/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${jwt}`
        }
    }).then((response) => {
        if (response.status !== 200) {
            return false;
        }
        return response.json().then(function (data) {
            if (data === 1) {
                return true;
            }
            return false;
        });
    });
    return auth;
}

export default authenticate;