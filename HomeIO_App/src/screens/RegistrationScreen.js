import React, { useState } from "react";
import { Text, ScrollView, Image, View, TextInput } from "react-native";
import tailwind from 'tailwind-rn';
import Icon from 'react-native-ico-material-design';
import PrimaryButton from '../components/PrimaryButton';
import styles from './Styles';
const Environment = require('../../environments');

const RegistrationScreen = ({ navigation }) => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [email, onChangeEmail] = useState('');
    const [password, onChangePassword] = useState('');
    const [passwordVerification, onChangePasswordVerification] = useState('');
    const register = async () => {
        if (password !== passwordVerification) {
            setError('Passwords don\'t match');
            return;
        }
        //console.log('sending register request..');
        let response = await fetch(Environment.HOST + '/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    console.log(data);
                    setSuccess('');
                    if (data.message) {
                        setError(data.message);
                    } else {
                        setError(data.errors[0].msg);
                    }
                });
                return;
            } else {
                response.json().then(function (data) {
                    console.log(data);
                    setError('');
                    setSuccess(data.message);
                });
                return;
            }
        }
        ).catch((err) => {
            console.log(err.message);
        });
    }
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
                        Εγγραφή
                    </Text>
                    <View style={[tailwind('w-full mt-6')]}>
                        <TextInput
                            placeholder="Email"
                            style={[tailwind('px-2 h-10 bg-gray-300 rounded-lg')]}
                            onChangeText={text => { onChangeEmail(text); setError(''); }}
                            value={email}
                        />
                        <TextInput
                            secureTextEntry={true}
                            placeholder="Κωδικός"
                            style={[tailwind('px-2 mt-2 h-10 bg-gray-300 rounded-lg')]}
                            onChangeText={text => { onChangePassword(text); setError(''); }}
                            value={password}
                        />
                        <TextInput
                            secureTextEntry={true}
                            placeholder="Επιβεβαίωση Κωδικού"
                            style={[tailwind('px-2 mt-2 h-10 bg-gray-300 rounded-lg')]}
                            onChangeText={text => { onChangePasswordVerification(text); setError(''); }}
                            value={passwordVerification}
                        />
                    </View>
                </View>
                <Text style={[tailwind((success.length) ? 'text-green-600 my-2' : 'text-red-600 my-2')]}>
                    {(success.length) ? success : error}
                </Text>
                <PrimaryButton
                    title="Εγγραφή"
                    onPress={() => { register(); }}
                />
                <View style={[tailwind('items-center mt-6 mb-2')]}>
                    <Text style={[tailwind('text-white')]}>
                        Έχετε ήδη λογαριασμό?
                        <Text style={[tailwind('text-indigo-600 text-lg')]}
                            onPress={() => { navigation.navigate('SignIn') }}
                        > Σύνδεση</Text>.
                    </Text>
                </View>
            </View>

        </ScrollView>
    );
};


export default RegistrationScreen;
