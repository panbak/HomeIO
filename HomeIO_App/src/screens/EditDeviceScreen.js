import React, { useState, useEffect, useCallback } from "react";
import { TextInput, Text, SafeAreaView, ScrollView, View, RefreshControl, Alert } from "react-native";
import tailwind from 'tailwind-rn';
import Icon from 'react-native-ico-material-design';
import { Picker } from '@react-native-picker/picker';
import PrimaryButton from '../components/PrimaryButton';
import IconButton from '../components/IconButton';
import IconOption from '../components/IconOption';
import ColorOption from '../components/ColorOption';
import DangerButton from '../components/DangerButton';
import GenericButton from '../components/GenericButton';
import styles from './Styles';
import { getUser, getJWT } from '../../auth';
const Environment = require('../../environments');

const EditDeviceScreen = ({ navigation: { goBack }, navigation, route }) => {
    const [deviceName, setDeviceName] = useState(route.params.device.name);
    const [deviceIcon, setDeviceIcon] = useState(route.params.device.icon);
    const [deviceColor, setDeviceColor] = useState(route.params.device.color);
    const [bluetoothConnected, setBluetoothConnected] = useState(false);
    const [groups, setGroups] = useState([]);
    const [deviceGroup, setDeviceGroup] = useState(((!route.params.device.group) ? 'none' : route.params.device.group._id));

    const [refreshing, setRefreshing] = useState(false);

    const deviceIcons = ["home-button", "flash-on-indicator", "light-bulb-on", "button-on", "thermostat-temperature-wheel", "change-power-options", "circle-outline", "locked-padlock-outline", "set-alarm", "city-buildings-silhouette", "circle-with-check-symbol", "cloud-symbol-inside-a-circle", "device-connected-1", "earth-grid-select-language-button", "emoticon-with-happy-face", "filled-speaker-with-white-details"];
    const deviceColors = ["bg-gray-700", "bg-red-600", "bg-yellow-600", "bg-yellow-300", "bg-green-600", "bg-gray-400", "bg-blue-600", "bg-indigo-600", "bg-purple-600", "bg-pink-600"];

    useEffect(() => {
        fetchGroups();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchGroups().then(() => {
            setRefreshing(false);
        });
    }, []);

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

    const editSuccessAlert = () => {
        Alert.alert(
            "Success",
            "Device updated successfully.",
            [
                {
                    text: "Go to Dashboard",
                    onPress: () => {
                        navigation.navigate('Dashboard');
                    }
                },
                {
                    text: "Stay",
                    style: "cancel"
                }
            ],
            { cancelable: true }
        );
    }

    const removeSuccessAlert = () => {
        Alert.alert(
            "Αφαιρέθηκε",
            "Η συσκευή αφαιρέθηκε επιτυχώς.",
            [
                {
                    text: "Πίσω στις συσκεύες",
                    onPress: () => {
                        navigation.navigate('Dashboard');
                    }
                }
            ],
            { cancelable: true }
        );
    }

    const confirmDeleteAlert = (name) => {
        Alert.alert(
            "Να αφαιρεθεί η " + route.params.device.name + "?",
            "Επιβεβαιώστε",
            [
                {
                    text: "Ναι, διαγραφή",
                    onPress: () => {
                        removeDevice();
                    }
                },
                {
                    text: "Άκυρο",
                    onPress: () => console.log("Cancel"),
                    style: "cancel"
                }
            ],
            { cancelable: true }
        );
    }

    const fetchGroups = async () => {
        let jwt = await getJWT();
        let request = await fetch(Environment.HOST + '/groups/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            }
        }).then((response) => {
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

    const updateDevice = async () => {
        let user = await getUser();
        let jwt = await getJWT();
        let request = await fetch(Environment.HOST + `/devices/update/${route.params.device._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            },
            body: JSON.stringify({ name: deviceName, group: deviceGroup, color: deviceColor, icon: deviceIcon })
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    errorAlert(data);
                });
                return;
            }
            response.text().then(function (data) {
                editSuccessAlert();
                return;
            });
        }).catch((err) => {
            errorAlert(err);
            return;
        });
    }

    const removeDevice = async () => {
        let user = await getUser();
        let jwt = await getJWT();
        let request = await fetch(Environment.HOST + `/devices/delete/${route.params.device._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            }
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    errorAlert(data);
                });
                return;
            }
            response.text().then(function (data) {
                removeSuccessAlert();
                return;
            });
        }).catch((err) => {
            errorAlert(err);
            return;
        });
    }

    return (
        <SafeAreaView style={[tailwind('bg-gray-900'), styles.safe]}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
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
                        Επεξεργασία
                    </Text>
                    <Text style={[tailwind('px-4 mb-6 text-gray-800 text-2xl font-bold')]}>
                        {route.params.device.name}
                    </Text>
                    <View style={[tailwind('px-4 mt-1 mb-2')]}>
                        <DangerButton
                            onPress={() => confirmDeleteAlert()}
                            disabled={false}
                            title="Αφαίρεση συσκευής"
                        />
                    </View>
                    <View style={[tailwind('px-4 mt-10 mb-2')]}>
                        <GenericButton
                            onPress={() => navigation.navigate('UpdateDeviceWifiCredentials', { device: route.params.device })}
                            height="18"
                            width="18"
                            icon="medium-wifi-signal-with-two-bars"
                            title="Αλλαγή WiFi"
                        />
                    </View>
                    <View style={[tailwind('px-4 mt-3 mb-10')]}>
                        <View style={[tailwind('w-full')]}>
                            <Text style={[tailwind('text-gray-700 font-bold mb-1')]}>
                                Όνομα Συσκεύης
                            </Text>
                            <TextInput
                                placeholder="e.g bedroom lamp"
                                style={[tailwind('px-2 h-10 bg-gray-300 rounded-lg')]}
                                onChangeText={text => setDeviceName(text)}
                                value={deviceName}
                            />
                            <Text style={[tailwind('text-gray-700 font-bold mb-1 mt-6')]}>
                                Ομάδα Συσκεύης
                            </Text>
                            <Picker
                                //mode="dropdown"
                                selectedValue={deviceGroup}
                                style={[tailwind('h-10 bg-gray-300')]}
                                onValueChange={(itemValue, itemIndex) =>
                                    setDeviceGroup(itemValue)
                                }>
                                <Picker.Item label="Χωρίς Ομάδα" value="none" />
                                {
                                    groups.map(function (group, index) {
                                        return <Picker.Item key={index} label={group.name} value={group._id} />
                                    })
                                }
                            </Picker>
                        </View>
                        <View style={[tailwind('w-full mt-6')]}>
                            <Text style={[tailwind('text-gray-700 font-bold mb-1')]}>
                                Εικονίδιο Συσκεύης
                            </Text>
                            <View style={[tailwind('flex flex-row flex-wrap justify-around mt-2')]}>
                                {deviceIcons.map(function (item, i) {
                                    return <IconOption
                                        selected={(item == deviceIcon) ? true : false}
                                        onPress={() => setDeviceIcon(item)}
                                        key={item}
                                        color="black"
                                        icon={item}
                                    />
                                })}
                            </View>
                        </View>
                        <View style={[tailwind('w-full mt-6 mb-12')]}>
                            <Text style={[tailwind('text-gray-700 font-bold mb-1')]}>
                                Χρώμα Συσκεύης
                        </Text>
                            <View style={[tailwind('flex flex-row flex-wrap justify-around mt-2')]}>
                                {deviceColors.map(function (item, i) {
                                    return <ColorOption
                                        selected={(item == deviceColor) ? true : false}
                                        onPress={() => setDeviceColor(item)}
                                        key={item}
                                        color={item}
                                    />
                                })}
                            </View>
                        </View>
                        <PrimaryButton
                            disabled={false} /* change to false to enable button */
                            style={[tailwind('mt-2')]}
                            title="Αποθήκευση Συσκεύης"
                            onPress={() => updateDevice()}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditDeviceScreen;
