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

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

const UserSettingsScreen = ({ navigation: { goBack }, navigation, route }) => {
    const [email, onChangeEmail] = useState('');
    const [password, onChangePassword] = useState('');
    const [verifyPassword, onChangeVerifyPassword] = useState('');
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const [refreshing, setRefreshing] = useState(false);

    const { getItem, setItem } = useAsyncStorage('user');

    const logoutHandler = async () => {
        const { runAuthCheck } = route.params;
        await logout();
        runAuthCheck();
    }

    const getUser = async () => {
        const user = JSON.parse(await getItem());
        onChangeEmail(user.user.email);
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getUser().then(() => {
            setRefreshing(false);
        });
    }, []);

    useEffect(() => {
        getUser();
    }, []);

    const writeUserToStorage = async user => {
        await setItem(user);
        setSaved(true);
    };

    const updateUser = async () => {
        if (password !== verifyPassword) {
            setError('Passwords don\'t match');
            return;
        }
        let jwt = await getJWT();
        let request = await fetch(Environment.HOST + '/users/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            },
            body: JSON.stringify({ email: email, password: password })
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    setError(data);
                });
                return;
            }
            response.json().then(function (data) {
                if (!response.ok) {
                    return;
                } else {
                    writeUserToStorage(JSON.stringify(data));
                    logoutHandler();
                }
            });
        }).catch((err) => {
            console.log(err.message);
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
            <ScrollView style={[tailwind('mx-4 px-2 bg-gray-100 mt-6'), styles.safe, styles.roundedXl]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Text style={[tailwind('px-4 text-sm text-gray-500 mt-6 font-bold')]}>
                    επεξεργασία στοιχείων
                    </Text>
                <View style={[tailwind('flex flex-row justify-between px-4 mb-6')]}>
                    <Text style={[tailwind('text-gray-800 text-2xl font-bold')]}>
                        Λογαριασμός
                    </Text>
                    <IconButton
                        color="#2d3748"
                        icon="share-button"
                        height="30"
                        width="30"
                        onPress={() => { navigation.navigate('ShareInvites'); }}
                    />
                </View>
                <View style={[tailwind('px-4 mt-3 mb-10'), styles.safe]}>
                    <View style={[tailwind('w-full')]}>
                        <Text style={[tailwind('text-gray-700 font-bold mb-1')]}>
                            Email
                        </Text>
                        <TextInput
                            placeholder="π.χ email@example.com"
                            style={[tailwind('px-2 h-10 bg-gray-300 rounded-lg')]}
                            onChangeText={text => { onChangeEmail(text); setSaved(false); setError(''); }}
                            value={email}
                        />
                    </View>
                    <View style={[tailwind('w-full mt-6')]}>
                        <Text style={[tailwind('text-gray-700 font-bold mb-1')]}>
                            Νέος Κωδικός
                        </Text>
                        <TextInput
                            secureTextEntry={true}
                            placeholder="π.χ ******"
                            style={[tailwind('px-2 h-10 bg-gray-300 rounded-lg')]}
                            onChangeText={text => { onChangePassword(text); setSaved(false); setError(''); }}
                            value={password}
                        />
                    </View>
                    <View style={[tailwind('w-full mt-6 mb-5')]}>
                        <Text style={[tailwind('text-gray-700 font-bold mb-1')]}>
                            Επιβεβαίωση Κωδικού
                        </Text>
                        <TextInput
                            secureTextEntry={true}
                            placeholder="π.χ ******"
                            style={[tailwind('px-2 h-10 bg-gray-300 rounded-lg')]}
                            onChangeText={text => { onChangeVerifyPassword(text); setSaved(false); setError(''); }}
                            value={verifyPassword}
                        />
                    </View>
                    <Text style={[tailwind(`text-green-500 text-lg mb-5 ${saved ? 'flex' : 'hidden'}`)]}>Your details have been saved</Text>
                    <Text style={[tailwind(`text-red-500 text-lg mb-5 ${error.length ? 'flex' : 'hidden'}`)]}>{error}</Text>
                    <PrimaryButton
                        title="Αποθήκευση"
                        onPress={() => updateUser()}
                    />
                    <DangerButton
                        title="Αποσύνδεση"
                        onPress={() => logoutHandler()}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default UserSettingsScreen;
