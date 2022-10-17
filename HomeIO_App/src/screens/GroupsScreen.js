import React, { useEffect, useState, useCallback } from "react";
import { Text, SafeAreaView, ScrollView, View, Alert, StyleSheet, TextInput, RefreshControl } from "react-native";
import tailwind from 'tailwind-rn';
import GroupCard from '../components/GroupCard';
import IconButton from '../components/IconButton';
import PrimaryButton from '../components/PrimaryButton';
import DangerButton from '../components/DangerButton';
import styles from './Styles';
import { Keyboard } from 'react-native';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { getUser, getJWT } from '../../auth';
import { useIsFocused } from '@react-navigation/native';
const Environment = require('../../environments');

const GroupsScreen = ({ route, navigation: { goBack }, navigation }) => {
    const isFocused = useIsFocused();

    const [groups, setGroups] = useState([]);

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, [isFocused]);

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

    const confirmDeleteAlert = (groupId, name) => {
        Alert.alert(
            "Delete " + name + "?",
            "please confirm",
            [
                {
                    text: "Yes, delete",
                    onPress: () => {
                        deleteGroup(groupId);
                    }
                },
                {
                    text: "Cancel",
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
        }
        ).catch((err) => {
            errorAlert(err);
        });
    }

    const deleteGroup = async (groupId) => {
        let user = await getUser();
        let jwt = await getJWT();
        let request = await fetch(`${Environment.HOST}/groups/delete/${groupId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            },
            body: JSON.stringify({ user_id: user._id })
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    errorAlert(data);
                });
                return;
            }
            response.json().then(function (data) {
                setGroups(groups.filter(item => { return (item._id !== groupId) }));
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
                    {groups.length} ομάδες
                </Text>
                <View style={[tailwind('flex flex-row justify-between px-4 mb-6')]}>
                    <Text style={[tailwind('text-gray-800 text-2xl font-bold')]}>
                        Οι ομάδες σας
                    </Text>
                    <IconButton
                        color="#2d3748"
                        icon="add-plus-button"
                        height="30"
                        width="30"
                        onPress={() => { navigation.navigate('AddGroup'); }}
                    />
                </View>
                <View style={[tailwind('mt-3 flex')]}>
                    {
                        groups.map(function (group, index) {
                            return <GroupCard
                                key={index}
                                name={group.name}
                                description={group.description}
                                edit={() => { navigation.navigate('EditGroup', group) }}
                                onPress={() => { confirmDeleteAlert(group._id, group.name); }}
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

export default GroupsScreen;
