import React, { useState, useEffect } from "react";
import { Text, ScrollView, Image, View, TextInput, Alert } from "react-native";
import tailwind from 'tailwind-rn';
import PrimaryButton from '../components/PrimaryButton';
import styles from './Styles';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
const Environment = require('../../environments');
import { logout } from '../../auth';

const AuthenticationScreen = ({ route, navigation }) => {
    const [error, setError] = useState('');
    const [email, onChangeEmail] = useState('');
    const [password, onChangePassword] = useState('');
    const { setItem } = useAsyncStorage('user');

    const writeUserToStorage = async user => {
        const { runAuthCheck } = route.params;
        await setItem(user);
        runAuthCheck();
    };

    const login = async () => {
        let request = await fetch(Environment.HOST + '/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    setError(data.message);
                    writeUserToStorage("");
                });
                return;
            }
            response.json().then(function (data) {
                if (!response.ok) {
                    writeUserToStorage("");
                } else {
                    writeUserToStorage(JSON.stringify(data));
                }
            });
        }).catch((err) => {
            Alert.alert(
                "Could not connect to server. Check your internet connection",
                JSON.stringify(data.message),
                [
                    {
                        text: "Ok",
                        style: "cancel"
                    }
                ],
                { cancelable: true }
            );
        });
    }

    useEffect(() => {
        fetch(Environment.HOST)
            .then((response) => {
                if (response.status !== 200) {
                    Alert.alert(
                        "Could not connect to server",
                        "Check your internet connection",
                        [
                            {
                                text: "Ok",
                                style: "cancel"
                            }
                        ],
                        { cancelable: true }
                    );
                    return;
                }
            }).catch((err) => {
                Alert.alert(
                    "Could not connect to server",
                    "Check your internet connection",
                    [
                        {
                            text: "Ok",
                            style: "cancel"
                        }
                    ],
                    { cancelable: true }
                );
            });
    });

    return (
        <ScrollView style={[tailwind('py-8 px-4 bg-indigo-700'), styles.safe]}>
            <View style={[tailwind('items-center')]}>
                <Image
                    style={[tailwind('my-10')]}
                    source={require('../../assets/homeio.png')}
                />
            </View>
            <View style={[tailwind('bg-gray-900 p-8 mx-1 bottom-0'), styles.roundedXY]}>
                <View style={[tailwind('items-center')]}>
                    <Text style={[tailwind('text-2xl text-white')]}>
                        Συνδεθείτε
                    </Text>
                    <Text style={[tailwind('text-2xl text-white')]}>

                    </Text>
                    <View style={[tailwind('w-full mt-6')]}>
                        <TextInput
                            placeholder="Email"
                            style={[tailwind('px-2 h-10 bg-gray-300 rounded-lg')]}
                            onChangeText={text => { onChangeEmail(text); setError('') }}
                            value={email}
                        />
                        <TextInput
                            secureTextEntry={true}
                            placeholder="Κωδικός"
                            style={[tailwind('px-2 mt-2 h-10 bg-gray-300 rounded-lg')]}
                            onChangeText={text => { onChangePassword(text); setError('') }}
                            value={password}
                        />
                    </View>
                </View>
                <Text style={[tailwind('text-red-600 my-2')]}>
                    {error}
                </Text>
                <PrimaryButton
                    title="Σύνδεση"
                    onPress={() => { login(); }}
                />
                <View style={[tailwind('items-center my-2')]}>
                    <Text style={[tailwind('text-sm text-gray-400')]}>
                        συνδεθείτε για να συνεχίσετε
                    </Text>
                </View>
                <View style={[tailwind('items-center mt-6 mb-2')]}>
                    <Text style={[tailwind('text-white')]}>
                        Δεν έχετε λογαριασμό?
                        <Text style={[tailwind('text-indigo-600 text-lg')]}
                            onPress={() => { navigation.navigate('Register') }}
                        > Εγγραφή</Text>.
                    </Text>
                </View>
            </View>

        </ScrollView>
    );
};


export default AuthenticationScreen;
