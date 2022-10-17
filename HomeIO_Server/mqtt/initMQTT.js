const aedes = require('aedes')()
const httpServer = require('http').createServer()
const https = require('https')
const ws = require('websocket-stream')
const wsPort = process.env.WS_PORT || 8888
const { commandParser } = require('./commandParser')
const User = require('../models/User');
const { updateClientState } = require('./clientStates');
const jwt = require('jsonwebtoken');
const Device = require('../models/Device')
const fs = require("fs");
require('dotenv/config');

const NODE_ENV = process.env.NODE_ENV || "production";


//two server instances are initiated. One for normal mqtt an one for mqtt over websockets
const initMQTT = (port) => {

    if (NODE_ENV === "production") {
        const options = {
            cert: fs.readFileSync(`${process.env.CERTIFICATES_FOLDER}/cert.pem`, 'utf8'),
            key: fs.readFileSync(`${process.env.CERTIFICATES_FOLDER}/privkey.pem`, 'utf8')
        }
        const server = require('tls').createServer(options, aedes.handle);
        server.listen(port, function () {
            console.log('MQTT server listening on port', port)
        });

        let wss = https.createServer(options);
        ws.createServer({
            server: wss
        }, aedes.handle);
        wss.listen(wsPort, function () {
            console.log('WSS server listening on port', wsPort)
        });
    } else {
        const server = require('net').createServer(aedes.handle)
        server.listen(port, function () {
            console.log('MQTT server listening on port', port)
        })

        ws.createServer({
            server: httpServer
        }, aedes.handle);
        httpServer.listen(wsPort, function () {
            console.log('WS server listening on port', wsPort)
        });
    }
    aedes.authenticate = async function (client, username, password, callback) {
        try {
            let { auth, type } = await isAuth(password.toString());
            if (auth === null) {
                callback(null, false);
            }
            client.entity_object = auth;
            client.entity_type = type;
            callback(null, auth);
        } catch (e) {
            console.log('[MQTT ERROR] UNAUTHORIZED ENTITY');
        }
    }
    aedes.on('clientError', function (client, err) {
        console.log('[CLIENT ERROR]', client.id, err.message, err.stack)
    })
    aedes.on('connectionError', function (client, err) {
        console.log('[CLIENT CONNECTION ERROR]', client, err.message, err.stack)
    })
    aedes.on('client', function (client, err) {
        console.log('[CLIENT CONNECTED]', client.id)
        if (client.entity_type == "device") {
            updateClientState(client.id, true);
        }
    })
    aedes.on('clientDisconnect', function (client, err) {
        console.log('[CLIENT DISCONNECTED]', client.id)
        if (client.entity_type == "device") {
            updateClientState(client.id, false);
        }
    })
    aedes.on('publish', function (packet, client) {
        if (client) {
            console.log("[PUBLISHING]");
            commandParser(packet, client); //send packet to parse
        }
    })
    aedes.on('subscribe', function (subscriptions, client) {
        if (client) {
            console.log('subscribe from client', subscriptions, client.id)
        }
    })
}

const isAuth = (token) => {
    let key = process.env.APP_KEY || "$homeIO$";
    if (token) {
        return jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return null;
            } else {
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                if (user) {
                    return { auth: user, type: "user" };
                }
                let device = await Device.findById(decodedToken.id);

                if (device) {
                    console.log(device);
                    return { auth: device, type: "device" };
                }
                return null;
            }
        })
    }
    return null;
}

exports.initMQTT = initMQTT;