import React, { useState, useEffect, useCallback } from "react";
import { TextInput, Text, SafeAreaView, ScrollView, View, RefreshControl } from "react-native";
import tailwind from 'tailwind-rn';
import Icon from 'react-native-ico-material-design';
import PrimaryButton from '../components/PrimaryButton';
import DangerButton from '../components/DangerButton';
import IconButton from '../components/IconButton';
import IconOption from '../components/IconOption';
import ColorOption from '../components/ColorOption';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import styles from './Styles';
import { logout, getJWT } from '../../auth';
import { LogBox } from 'react-native';
const Environment = require('../../environments');

const ShareDeviceScreen = ({ navigation: { goBack }, navigation, route }) => {
    const [email, onChangeEmail] = useState('');

    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const shareDevice = async () => {
        let jwt = await getJWT();
        let request = await fetch(Environment.HOST + '/devices/share', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            },
            body: JSON.stringify({ device: route.params.device.device._id, email: email })
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    setError(data.message);
                });
                return;
            }
            response.json().then(function (data) {
                setSaved(true);
            });
        }).catch((err) => {
            setError(err);
        });
    }

    return (
        <SafeAreaView style={[tailwind('bg-gray-900'), styles.safe]}>

            <View style={[tailwind('px-6 mt-3 flex flex-row justify-between')]}>
                <IconButton
                    color="white"
                    icon="go-back-left-arrow"
                    height="23"
                    width="23"
                    onPress={() => goBack()}
                />
            </View>
            <ScrollView style={[tailwind('mx-4 px-2 bg-gray-100 mt-6'), styles.safe, styles.roundedXl]} >
                <Text style={[tailwind('px-4 text-sm text-gray-500 mt-6 font-bold')]}>
                    Διαμοιρασμός συσκεύης
                    </Text>
                <Text style={[tailwind('px-4 mb-6 text-gray-800 text-2xl font-bold')]}>
                    {route.params.device.name}
                </Text>
                <View style={[tailwind('px-4 mt-12 mb-10'), styles.safe]}>
                    <View style={[tailwind('w-full')]}>
                        <Text style={[tailwind('text-gray-700 font-bold mb-6 text-center text-xl')]}>
                            Εισάγετε το <Text style={[tailwind('underline')]}>email</Text> του χρήστη που επιθυμείτε να δώσετε πρόσβαση.
                        </Text>
                    </View>
                    <View style={[tailwind('w-full mb-10')]}>
                        <TextInput
                            placeholder="π.χ email@example.com"
                            style={[tailwind('px-2 h-10 bg-gray-300 rounded-lg')]}
                            onChangeText={text => { onChangeEmail(text); setSaved(false); setError(''); }}
                            value={email}
                            autoCompleteType="email"
                        />
                    </View>
                    <PrimaryButton
                        title="Αποστολή Πρόσκλησης Πρόσβασης"
                        onPress={() => shareDevice()}
                    />
                    <Text style={[tailwind(`text-green-500 text-lg mb-5 ${saved ? 'flex' : 'hidden'}`)]}>Access invite has been sent</Text>
                    <Text style={[tailwind(`text-red-500 text-lg mb-5 ${error.length ? 'flex' : 'hidden'}`)]}>{error}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ShareDeviceScreen;
