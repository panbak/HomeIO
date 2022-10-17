import React, { useEffect, useState, useCallback } from "react";
import { Text, SafeAreaView, ScrollView, View, Alert, StyleSheet, TextInput, RefreshControl } from "react-native";
import tailwind from 'tailwind-rn';
import InviteCard from '../components/InviteCard';
import IconButton from '../components/IconButton';
import PrimaryButton from '../components/PrimaryButton';
import DangerButton from '../components/DangerButton';
import styles from './Styles';
import { Keyboard } from 'react-native';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { getUser, getJWT } from '../../auth';
import { useIsFocused } from '@react-navigation/native';
const Environment = require('../../environments');

const ShareInvitesScreen = ({ route, navigation: { goBack }, navigation }) => {
    const isFocused = useIsFocused();

    const [invites, setInvites] = useState([]);
    const [invites_sent, setInvitesSent] = useState([]);

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (isFocused) {
            fetchInvites();
            fetchSentInvites();
        }
    }, [isFocused]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSentInvites();
        fetchInvites().then(() => {
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

    const confirmDeleteAlert = (msg, inviteId, name, func) => {
        Alert.alert(
            msg,
            name,
            [
                {
                    text: "Yes",
                    onPress: () => {
                        eval(func)(inviteId);
                    }
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ],
            { cancelable: true }
        );
    }

    const fetchInvites = async () => {
        let jwt = await getJWT();
        let request = await fetch(Environment.HOST + '/devices/shares', {
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
            response.json().then(function (data) {
                setInvites(data);
            });
        }
        ).catch((err) => {
            errorAlert(err);
        });
    }

    const fetchSentInvites = async () => {
        let jwt = await getJWT();
        let request = await fetch(Environment.HOST + '/devices/shares/sent', {
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
            response.json().then(function (data) {
                setInvitesSent(data);
            });
        }
        ).catch((err) => {
            errorAlert(err);
        });
    }

    const acceptInvite = async (inviteId) => {
        let jwt = await getJWT();
        let request = await fetch(Environment.HOST + '/devices/share/accept', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            },
            body: JSON.stringify({ share: inviteId })
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    errorAlert(data);
                });
                return;
            }
            response.json().then(function (data) {
                setInvites(invites.filter(item => { return (item._id !== inviteId) }));
            });
        }
        ).catch((err) => {
            errorAlert(err);
        });
    }

    const rejectInvite = async (inviteId) => {
        let jwt = await getJWT();
        let request = await fetch(Environment.HOST + '/devices/share/reject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            },
            body: JSON.stringify({ share: inviteId })
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    errorAlert(data);
                });
                return;
            }
            response.json().then(function (data) {
                console.log('test');
                setInvites(invites.filter(item => { return (item._id !== inviteId) }));
            });
        }
        ).catch((err) => {
            errorAlert(err);
        });
    }

    const cancelInvite = async (inviteId) => {
        let jwt = await getJWT();
        let request = await fetch(Environment.HOST + '/devices/share/cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            },
            body: JSON.stringify({ share: inviteId })
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    errorAlert(data);
                });
                return;
            }
            response.json().then(function (data) {
                console.log('test');
                setInvitesSent(invites_sent.filter(item => { return (item._id !== inviteId) }));
            });
        }
        ).catch((err) => {
            errorAlert(err);
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
                    you have {invites.length + invites_sent.length} share invites
                </Text>
                <View style={[tailwind('flex flex-row justify-between px-4 mb-6')]}>
                    <Text style={[tailwind('text-gray-800 text-2xl font-bold')]}>
                        Received Invites
                    </Text>
                </View>
                <View style={[tailwind('mt-3 flex flex-row flex-wrap justify-around')]}>
                    {
                        (invites.length ? null : <Text style={[tailwind('mt-6 text-gray-500 text-lg')]}>you have no invites</Text>)
                    }
                    {
                        invites.map(function (invite, index) {
                            return <InviteCard
                                key={index}
                                name={invite.device_instance.name}
                                email={invite.user_id.email}
                                onAccept={() => { acceptInvite(invite._id) }}
                                onReject={() => { confirmDeleteAlert('Reject Invite?', invite._id, invite.device_instance.name, rejectInvite) }}
                            />
                        })
                    }
                </View>
                <View style={[tailwind('flex flex-row justify-between px-4 mb-6 mt-16')]}>
                    <Text style={[tailwind('text-gray-800 text-2xl font-bold')]}>
                        Sent Invites
                    </Text>
                </View>
                <View style={[tailwind('mt-3 flex flex-row flex-wrap justify-around')]}>
                    {
                        (invites_sent.length ? null : <Text style={[tailwind('mt-6 text-gray-500 text-lg')]}>you haven't send invites yet</Text>)
                    }
                    {
                        invites_sent.map(function (invite, index) {
                            return <InviteCard
                                key={index}
                                name={invite.device_instance.name}
                                email={invite.receiver.email}
                                mode="sent"
                                onCancel={() => { confirmDeleteAlert('Cancel Invite?', invite._id, invite.device_instance.name, cancelInvite) }}
                            />
                        })
                    }
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const localStyles = StyleSheet.create({
    dialogBg: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }
});

export default ShareInvitesScreen;
