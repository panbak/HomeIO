import React, { useState, useEffect, useCallback, useContext } from "react";
import { Text, SafeAreaView, ScrollView, View, Alert, RefreshControl } from "react-native";
import tailwind from 'tailwind-rn';
import DeviceCard from '../components/DeviceCard';
import IconButton from '../components/IconButton';
import styles from './Styles';
import { getJWT } from '../../auth';
import { useIsFocused } from '@react-navigation/native'
import { Picker } from '@react-native-picker/picker';
import { AppContext } from '../../AppContext';
const Environment = require('../../environments');

const DashboardScreen = ({ navigation }) => {

    const context = useContext(AppContext);

    var options = {
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
        console.log(topic);
        let topic_parts = topic.split('/');
        if (topic_parts[1] == 'online') {
            const updatedDevices = devices.map(device => {
                if (device.device.device_code === topic_parts[0]) {
                    return { ...device, online: true };
                }
                return device;
            });
            setDevices(updatedDevices);
        }
    });

    const isFocused = useIsFocused();

    useEffect(() => {
        fetchDevices();
        fetchGroups();
        if (isFocused) { //only when focused subscribe
            client.on('connect', function () {
                devices.map((device) => {
                    client.subscribe(`${device.device.device_code}/state`, function (err) {
                        if (err) {
                            console.log('[ERROR] Subscribing to ' + device.device.device_code + '/state');
                        } else {
                            console.log('[SUBSCRIBED] ' + device.device.device_code + '/state');
                        }
                    })
                    client.subscribe(`${device.device.device_code}/online`, function (err) {
                        if (err) {
                            console.log('[ERROR] Subscribing to ' + device.device.device_code + '/online');
                        } else {
                            console.log('[SUBSCRIBED] ' + device.device.device_code + '/online');
                        }
                    })
                });
            });
        }

        return () => {
            if (devices.length) {
                devices.map((device) => {
                    client.unsubscribe(device.device.device_code + '/state', function (err) {
                        if (err) {
                            console.log('[ERROR] Unsubscribing from ' + device.device.device_code + '/state');
                        } else {
                            console.log('[UNSUBSCRIBED] ' + device.device.device_code + '/state');
                        }
                    });
                    client.unsubscribe(device.device.device_code + '/online', function (err) {
                        if (err) {
                            console.log('[ERROR] Unsubscribing from ' + device.device.device_code + '/online');
                        } else {
                            console.log('[UNSUBSCRIBED] ' + device.device.device_code + '/online');
                        }
                    });
                });
                client.end();
            }
        }
    }, [isFocused]);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDevices().then(() => {
            setRefreshing(false);
        });
    }, []);

    const [devices, setDevices] = useState([]);
    const [groups, setGroups] = useState([]);
    const [group, setGroup] = useState(null);

    const errorAlert = (data) => {
        Alert.alert(
            "Υπήρξε κάποιο πρόβλημα.",
            JSON.stringify(data.message),
            [
                {
                    text: "Ok",
                    style: "Άκυρο"
                }
            ],
            { cancelable: true }
        );
    }

    const fetchDevices = async () => {
        let jwt = await getJWT();
        console.debug('JWT: ' + jwt);
        let request = await fetch(Environment.HOST + '/devices/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            }
        }).then(async (response) => {
            if (response.status !== 200) {

                response.json().then(function (data) {
                    errorAlert(data);
                });
                return;
            }
            response.json().then(function (data) {
                console.debug('DATA: ' + JSON.stringify(data));
                setDevices(data);
            });
        }).catch((err) => {
            errorAlert(err);
        });
    }

    const fetchGroups = async () => {
        let jwt = await getJWT();
        console.debug('JWT: ' + jwt);
        let request = await fetch(Environment.HOST + '/groups/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            }
        }).then(async (response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    errorAlert(data);
                });
                return;
            }
            response.json().then(function (data) {
                setGroups(data);
            });
        }).catch((err) => {
            errorAlert(err);
        });
    }


    const toggleDeviceState = (device_code, isEnabled, index) => {
        devices[index].device.state = !isEnabled
        try {
            let packet = {
                device: device_code,
                timestamp: new Date(),
                value: !isEnabled
            };
            client.publish(device_code + '/state', JSON.stringify(packet));
        } catch (err) {
            errorAlert(err);
        }
        return (devices[index].device.state);
    }

    return (
        <SafeAreaView style={[tailwind('bg-gray-900'), styles.safe]}>
            <View style={[tailwind('px-6 mt-3 flex flex-row justify-around')]}>
                <IconButton
                    color="white"
                    icon="two-rows-and-three-columns-layout"
                    height="25"
                    width="25"
                    onPress={() => { navigation.navigate('Groups') }}
                />
                <IconButton
                    color="white"
                    icon="poll-symbol-on-black-square-with-rounded-corners"
                    height="25"
                    width="25"
                    onPress={() => { navigation.navigate('DeviceCharts') }}
                />
                <IconButton
                    color="white"
                    icon="settings-cogwheel-button"
                    height="25"
                    width="25"
                    onPress={() => { navigation.navigate('UserSettings') }}
                />
            </View>
            <ScrollView style={[tailwind('mx-4 px-2 bg-gray-100 mt-6'), styles.safe, styles.roundedXl]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Text style={[tailwind('px-4 text-sm text-gray-500 mt-6 font-bold')]}>
                    {devices.length} συσκευές
                </Text>
                <View style={[tailwind('flex flex-row justify-between px-4 mb-6')]}>
                    <Text style={[tailwind('text-gray-800 text-2xl font-bold')]}>
                        Οι συσκευές σας
                    </Text>
                    <IconButton
                        color="#2d3748"
                        icon="add-plus-button"
                        height="30"
                        width="30"
                        onPress={() => { navigation.navigate('AddDevice') }}
                    />
                </View>
                <Picker
                    mode="dropdown"
                    selectedValue={group}
                    style={[tailwind('h-10 bg-gray-200 w-11/12 mb-2'), { marginLeft: "auto", marginRight: "auto" }]}
                    onValueChange={(itemValue, itemIndex) =>
                        setGroup(itemValue)
                    }>
                    <Picker.Item label="Όλες" value={null} />
                    {
                        groups.map((group, index) => {
                            return <Picker.Item key={index} label={group.name} value={group._id} />
                        })
                    }
                </Picker>
                <View style={[tailwind('mt-3 flex flex-row flex-wrap justify-around')]}>
                    {
                        (devices.length ? null : <Text style={[tailwind('mt-6 text-gray-500 text-lg')]}>Επιλέξτε '+' για νέα συσκεύη</Text>)
                    }
                    {
                        devices.map((device, index) => {
                            if (group == null || (device.group != null && device.group._id === group)) {
                                console.log(device)
                                return <DeviceCard
                                    icon={device.icon}
                                    color={device.color}
                                    name={device.name}
                                    key={device._id}
                                    onPress={() => navigation.navigate('Device', { device: device })}
                                    onToggle={() => toggleDeviceState(device.device.device_code, device.device.state, index)}
                                    isEnabled={device.device.state}
                                    online={device.isOnline}
                                />
                            }
                        })
                    }
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DashboardScreen;
