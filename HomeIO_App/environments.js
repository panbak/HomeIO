var _Environments = {
    production: { HOST: 'https://homeio.panbak.com', MQTT: 'wss://homeio.panbak.com:8443' },
    development: { HOST: 'http://192.168.43.83:2020', API_KEY: '', MQTT: 'ws://192.168.43.83:8888' },
}

function getEnvironment(platform) {
    return _Environments[platform];
}

var Environment = getEnvironment('production');

module.exports = Environment;