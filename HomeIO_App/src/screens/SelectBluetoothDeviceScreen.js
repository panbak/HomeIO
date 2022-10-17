import React, { useState, useEffect, useCallback } from "react";
import { TouchableOpacity, Text, SafeAreaView, ScrollView, View, RefreshControl, Alert, PermissionsAndroid, NativeModules, NativeEventEmitter, TextInput, Platform } from "react-native";
import tailwind from 'tailwind-rn';
import IconButton from '../components/IconButton';
import styles from './Styles';
import { BleManager } from 'react-native-ble-plx';
import base64 from 'react-native-base64';

const SelectBluetoothDeviceScreen = ({ route, navigation: { goBack }, navigation }) => {

    const _BleManager = new BleManager();

    const [refreshing, setRefreshing] = useState(false);

    const [buttonText, setButtonText] = useState("Σύνδεση");

    const [device, setDevice] = useState(null);

    const [ssid, setSSID] = useState(null);
    const [password, setPassword] = useState(null);

    const [readSuccess, setReadSuccess] = useState(false);
    const [writeSuccess, setWriteSuccess] = useState(false);

    const [deviceCode, setDeviceCode] = useState(null);

    useEffect(() => {
        if (readSuccess && writeSuccess) {
            navigation.navigate('AddDevice', { deviceCode: deviceCode });
        }
    }, [readSuccess, writeSuccess, deviceCode])

    const onChangeSSID = (text) => {
        setSSID(text);
        //setSSID64(base64.encode(text));
    }

    const onChangePassword = (text) => {
        setPassword(text);
        //setPassword64(base64.encode(text));
    }

    const startScan = () => {
        setRefreshing(true);
        _BleManager.startDeviceScan(null, {
            allowDuplicates: false,
        },
            async (error, device) => {
                if (error) {
                    BleManager.stopDeviceScan();
                }
                console.log(device.localName, device.name);
                if (device.localName == 'HomeIO' || device.name == 'HomeIO Plug' || device.name == 'HomeIO Device') {
                    setDevice(device);
                    _BleManager.stopDeviceScan();
                    console.log(device);
                    setRefreshing(false);
                }
            });
    };

    const connectDevice = device => {
        setButtonText("Περιμένετε..");
        let wifiConnectionString = ssid + ";" + password;
        _BleManager.stopDeviceScan();
        _BleManager.connectToDevice(device.id).then(async device => {
            await device.discoverAllServicesAndCharacteristics();
            _BleManager.stopDeviceScan();
            device.readCharacteristicForService(
                "6f581fe2-b873-4fd5-b27f-ead4948a45db",
                "d0b779be-34ee-4920-9f14-c2f3e88cddca",
                null
            ).then(characteristic => {
                console.log(base64.decode(characteristic.value));
                setDeviceCode(base64.decode(characteristic.value).toLowerCase());
                setReadSuccess(true);
            });

            device.writeCharacteristicWithResponseForService(
                "6f581fe2-b873-4fd5-b27f-ead4948a45db",
                "5afe1153-5662-44f5-8783-cd706d60ddc6",
                base64.encode(wifiConnectionString)
            ).then(characteristic => {
                console.log(characteristic);
                setWriteSuccess(true);
            });
        }).catch(e => {
            console.log(e);
            connectDevice(device); //retry connection
        });
    };

    useEffect(() => {
        if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
                if (result) {
                    console.log("Permission is OK");
                } else {
                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
                        if (result) {
                            console.log("User accept");
                        } else {
                            console.log("User refuse");
                        }
                    });
                }
            });
        }

        const subscription = _BleManager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                startScan();
                subscription.remove();
            }
        }, true);

        return (() => {
            _BleManager.stopDeviceScan();
            _BleManager.destroy();
        })
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setDevice(null);
        startScan();
    }, []);

    return (
        <SafeAreaView style={[tailwind('bg-gray-900'), styles.safe]}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={[tailwind('px-6 mt-3 flex flex-row justify-between')]}>
                    <IconButton
                        color="white"
                        icon="close-button"
                        height="23"
                        width="23"
                        text="Cancel"
                        onPress={() => goBack()}
                    />
                </View>
                <View style={[tailwind('mx-4 px-2 bg-gray-100 mt-6 pb-6'), styles.safe, styles.roundedXl]}>
                    <Text style={[tailwind('px-4 text-sm text-gray-500 mt-6 font-bold')]}>
                        συνδέστε μια συσκευή την φορά
                    </Text>
                    <Text style={[tailwind('px-4 mb-6 text-gray-800 text-2xl font-bold')]}>
                        Σύζευξη
                    </Text>
                    <View style={[tailwind('mt-3 flex')]}>
                        {
                            !device ?
                                <Text style={[tailwind("text-center text-lg px-4")]}>..σάρωση για συσκευές..</Text>
                                :
                                <>
                                    <View style={[tailwind('w-full mb-2 p-4 flex bg-gray-200 rounded')]}>
                                        <View style={[tailwind('flex flex-row justify-around')]}>
                                            <Text style={[tailwind('text-gray-900 text-center text-lg font-bold')]} >{device.name}</Text>
                                        </View>
                                        <TextInput
                                            placeholder="WIFI SSID"
                                            style={[tailwind('px-2 h-10 bg-gray-300 rounded-lg my-2')]}
                                            onChangeText={text => { onChangeSSID(text) }}
                                            value={ssid}
                                        />
                                        <TextInput
                                            placeholder="WIFI Password"
                                            style={[tailwind('px-2 h-10 bg-gray-300 rounded-lg my-2')]}
                                            onChangeText={text => { onChangePassword(text) }}
                                            value={password}
                                        />
                                    </View>
                                    <TouchableOpacity style={[tailwind('flex flex-row justify-around bg-gray-900 p-4 rounded my-2')]}
                                        onPress={() => connectDevice(device)}
                                    >
                                        <Text style={[tailwind('text-white text-center text-lg font-bold')]}>{buttonText}</Text>
                                    </TouchableOpacity>
                                </>
                        }
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default SelectBluetoothDeviceScreen;