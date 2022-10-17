import React, { useState, useEffect, useCallback } from "react";
import { TextInput, Text, SafeAreaView, ScrollView, View, RefreshControl, Alert } from "react-native";
import tailwind from 'tailwind-rn';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import PrimaryButton from '../components/PrimaryButton';
import IconButton from '../components/IconButton';
import IconOption from '../components/IconOption';
import ColorOption from '../components/ColorOption';
import GenericButton from '../components/GenericButton';
import styles from './Styles';
import { getUser, getJWT } from '../../auth';
const Environment = require('../../environments');

const AddDeviceScreen = ({ navigation: { goBack }, navigation }) => {
    const [deviceName, onChangeText] = useState('');
    const [deviceCode, setDeviceCode] = useState(null);
    const [deviceIcon, setDeviceIcon] = useState('');
    const [deviceColor, setDeviceColor] = useState('');
    const [groups, setGroups] = useState([]);
    const [deviceGroup, setDeviceGroup] = useState('none');

    const [refreshing, setRefreshing] = useState(false);

    const deviceIcons = ["home-button", "flash-on-indicator", "light-bulb-on", "button-on", "thermostat-temperature-wheel", "change-power-options", "circle-outline", "locked-padlock-outline", "set-alarm", "city-buildings-silhouette", "circle-with-check-symbol", "cloud-symbol-inside-a-circle", "device-connected-1", "earth-grid-select-language-button", "emoticon-with-happy-face", "filled-speaker-with-white-details"];
    const deviceColors = ["bg-gray-700", "bg-red-600", "bg-yellow-600", "bg-yellow-300", "bg-green-600", "bg-gray-400", "bg-blue-600", "bg-indigo-600", "bg-purple-600", "bg-pink-600"];

    const route = useRoute();

    useEffect(() => {
        fetchGroups();
        const { params } = route;
        try {
            setDeviceCode(params.deviceCode);
            console.log('code: ' + params.deviceCode);
        } catch {
            setDeviceCode(null);
            console.log('catch');
        }
    }, [route.params]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        onChangeText('');
        setDeviceCode(null);
        setDeviceColor('');
        setDeviceIcon('');
        setDeviceGroup('none');
        fetchGroups().then(() => {
            setRefreshing(false);
        });
    }, []);

    const errorAlert = (data) => {
        console.log(data);
        Alert.alert(
            "Κάτι πήγε στραβά.",
            JSON.stringify(data.message),
            [
                {
                    text: "Ok",
                    style: "Ακύρωση"
                }
            ],
            { cancelable: true }
        );
    }

    const successAlert = () => {
        Alert.alert(
            "Επιτυχία",
            "Η συσκεύη έχει δημιουργηθεί.",
            [
                {
                    text: "Όλες οι συσκεύες",
                    onPress: () => {
                        navigation.navigate('Dashboard');
                    }
                },
                {
                    text: "Προσθήκη νέας",
                    onPress: () => {
                        onChangeText('');
                        setDeviceIcon('');
                        setDeviceColor('');
                        setDeviceCode(null);
                        setDeviceGroup('none');
                    },
                    style: "Ακύρωση"
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

    const createDevice = async () => {
        let user = await getUser();
        let jwt = await getJWT();
        if (!deviceCode) {
            return;
        }
        let request = await fetch(Environment.HOST + '/devices/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            },
            body: JSON.stringify({ name: deviceName, group: deviceGroup, color: deviceColor, icon: deviceIcon, device_code: deviceCode })
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    console.log(data);
                    errorAlert(data);
                });
                return;
            }
            response.text().then(function (data) {
                successAlert();
                return;
            });
        }).catch((err) => {
            errorAlert(err);
            return;
        });
    }

    const selectBTDevice = () => {
        navigation.navigate('SelectBluetoothDevice');
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
                        σταθείτε δίπλα στην συσκευή
                    </Text>
                    <Text style={[tailwind('px-4 mb-6 text-gray-800 text-2xl font-bold')]}>
                        Προσθήκη Συσκεύης
                    </Text>
                    <View style={[tailwind('px-4 mt-1 mb-2')]}>
                        <GenericButton
                            onPress={() => selectBTDevice()}
                            height="18"
                            width="18"
                            icon={`${deviceCode ? 'check-symbol' : 'blueetooth-logo'}`}
                            title={`${deviceCode ? 'Συνδέθηκε' : 'Σάρωση συσκεύης'}`}
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
                                onChangeText={text => onChangeText(text)}
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
                                <Picker.Item key={0} label="Χωρίς Ομάδα" value="none" />
                                {
                                    groups.map((group, index) => {
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
                            disabled={deviceCode && deviceName.length && deviceColor.length && deviceIcon.length ? false : true}
                            style={[tailwind('mt-2')]}
                            title="Αποθήκευση Συσκεύης"
                            onPress={() => createDevice()}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddDeviceScreen;
