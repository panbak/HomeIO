import React, { useState, useEffect, useContext } from "react";
import { Text, SafeAreaView, ScrollView, View, Alert } from "react-native";
import tailwind from 'tailwind-rn';
import IconButton from '../components/IconButton';
import GenericButton from '../components/GenericButton';
import { useIsFocused } from '@react-navigation/native';
import { getJWT } from '../../auth';
import styles from './Styles';
import { AppContext } from '../../AppContext';

const Environment = require('../../environments');

const DeviceScreen = ({ route, navigation: { goBack }, navigation }) => {

    const context = useContext(AppContext);

    var client = context.store.mqtt_client;

    const isFocused = useIsFocused();

    const [stats, setStats] = useState([]);

    const deviceInstance = route.params.device;

    var options = {
        keepalive: 10,
        clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        qos: 2,
        username: '',
        password: context.store.jwt,
        rejectUnauthorized: false
    }

    const mqtt = require('@taoqf/react-native-mqtt');
    var client = mqtt.connect(Environment.MQTT, options);

    client.on('message', function (topic, message) {
        console.log((message.toString()));
        setLiveConsumption(JSON.parse(message).value);
    })


    const errorAlert = (data) => {
        Alert.alert(
            "Something went wrong.",
            JSON.stringify(data.message),
            [
                {
                    text: "Ok",
                    style: "cancel"
                }
            ],
            { cancelable: true }
        );
    }

    const fetchStats = async (signal) => {
        let jwt = await getJWT();
        let request = await fetch(Environment.HOST + '/consumptions/stats', {
            signal: signal,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            },
            body: JSON.stringify({ device_instance_id: deviceInstance._id })
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    errorAlert(data);
                });
                return;
            }
            response.json().then(function (data) {
                setStats(data);
            });
        }).catch((err) => {
            if (err.name !== 'AbortError') { //dont alert abort error due to cleanup function
                errorAlert(err);
            }
        });
    }

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;
        fetchStats(signal);
        if (isFocused) {
            client.on('connect', function () {
                client.subscribe(deviceInstance.device.device_code + '/instant', function (err) {
                    if (err) {
                        console.log('[ERROR] Subscribing to ' + deviceInstance.device.device_code + '/instant');
                    } else {
                        console.log('[SUBSCRIBED] ' + deviceInstance.device.device_code + '/instant');
                    }
                })
            })
        }

        return () => {
            abortController.abort();
            client.unsubscribe(deviceInstance.device.device_code + '/instant', function (err) {
                if (err) {
                    console.log('[ERROR] Unsubscribing from ' + deviceInstance.device.device_code + '/instant');
                } else {
                    console.log('[UNSUBSCRIBED] ' + deviceInstance.device.device_code + '/instant');
                }
            });
            client.end();
        }
    }, [isFocused]);

    const [liveConsumption, setLiveConsumption] = useState(0.0);

    return (
        <SafeAreaView style={[tailwind('pt-12 bg-gray-900'), styles.safe]}>
            <View style={[tailwind('px-6 mt-3 flex flex-row justify-between')]}>
                <IconButton
                    color="white"
                    icon="go-back-left-arrow"
                    height="23"
                    width="23"
                    onPress={() => goBack()}
                />
            </View>
            <View style={[tailwind('mx-4 px-2 bg-gray-100 mt-6'), styles.safe, styles.roundedXl]}>
                <Text style={[tailwind('px-4 text-sm text-gray-500 mt-6 font-bold')]}>
                    ενεργειακή κατανάλωση
                </Text>
                <View style={[tailwind('flex flex-row justify-between px-4 mb-6')]}>
                    <Text style={[tailwind('mb-6 text-gray-800 text-2xl font-bold w-3/5')]}>
                        {deviceInstance.name}
                    </Text>
                    <IconButton
                        color="#2d3748"
                        icon="share-button"
                        height="30"
                        width="30"
                        onPress={() => { navigation.navigate('ShareDevice', route.params) }}
                    />
                    <IconButton
                        color="#2d3748"
                        icon="settings-cogwheel-button"
                        height="30"
                        width="30"
                        onPress={() => { navigation.navigate('EditDevice', route.params) }}
                    />
                </View>
                <ScrollView style={[tailwind('px-4 mt-3 mb-10')]}>
                    <View style={[tailwind('w-full flex-row justify-around py-6')]}>
                        <View style={[tailwind('flex')]}>
                            <Text style={[tailwind('text-gray-800 text-4xl font-bold text-center')]}>{liveConsumption.toFixed(2)}</Text>
                            <Text style={[tailwind('text-gray-800 text-sm font-bold text-center')]}>Watt</Text>
                        </View>
                    </View>
                    <View style={[tailwind('flex flex-row mt-12')]}>
                        {
                            stats.length ? <>
                                <View style={[tailwind('flex-1 items-center')]}>
                                    <Text style={[tailwind('text-xl font-bold text-gray-800 underline')]}>Περίοδος</Text>
                                </View>
                                <View style={[tailwind('flex-1 items-center')]}>
                                    <Text style={[tailwind('text-xl font-bold text-gray-800 underline')]}>kWh</Text>
                                </View>
                            </> : <View style={[tailwind('flex-1 items-center')]}>
                                <Text style={[tailwind('text-lg font-bold text-gray-800 mt-20')]}>Δεν υπάρχουν αρκετά δεδομένα.</Text>
                            </View>
                        }
                    </View>
                    {
                        stats.length ? stats.map(function (stat, index) {
                            return (
                                <View style={[tailwind('flex flex-row mt-12')]} key={index}>
                                    <View style={[tailwind('flex-1 items-center')]}>
                                        <Text style={[tailwind('text-lg text-gray-800 font-bold')]}>{stat._id}</Text>
                                    </View>
                                    <View style={[tailwind('flex-1 items-center')]}>
                                        <Text style={[tailwind('text-lg text-gray-800')]}>{parseFloat(stat.total_kwh).toFixed(2)}</Text>
                                    </View>
                                </View>)
                        }) : null
                    }
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default DeviceScreen;
