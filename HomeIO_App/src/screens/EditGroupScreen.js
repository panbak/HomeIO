import React, { useState, useEffect, useCallback } from "react";
import { TextInput, Text, SafeAreaView, ScrollView, View, RefreshControl, Alert } from "react-native";
import tailwind from 'tailwind-rn';
import PrimaryButton from '../components/PrimaryButton';
import IconButton from '../components/IconButton';
import styles from './Styles';
import { getJWT } from '../../auth';
const Environment = require('../../environments');

const EditGroupScreen = ({ navigation: { goBack }, navigation, route }) => {
    const [groupName, setGroupName] = useState(route.params.name);
    const [groupDescription, setGroupDescription] = useState(route.params.description);

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setRefreshing(false);
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

    const successAlert = () => {
        Alert.alert(
            "Success",
            "Group updated successfully.",
            [
                {
                    text: "Back to Groups",
                    onPress: () => {
                        navigation.navigate('Groups');
                    }
                }
            ],
            { cancelable: true }
        );
    }

    const createGroup = async () => {
        let jwt = await getJWT();
        let request = await fetch(Environment.HOST + `/groups/update/${route.params._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            },
            body: JSON.stringify({ name: groupName, description: groupDescription })
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    errorAlert(data);
                });
                return;
            }
            response.json().then(function (data) {
                successAlert();
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
                    editing
                    </Text>
                <Text style={[tailwind('px-4 mb-6 text-gray-800 text-2xl font-bold')]}>
                    {route.params.name}
                </Text>
                <View style={[tailwind('px-4 mt-3 mb-10')]}>
                    <View style={[tailwind('w-full mb-6')]}>
                        <Text style={[tailwind('text-gray-700 font-bold mb-1')]}>
                            Group name
                            </Text>
                        <TextInput
                            placeholder="e.g Group 1"
                            style={[tailwind('px-2 h-10 bg-gray-300 rounded-lg')]}
                            onChangeText={text => setGroupName(text)}
                            value={groupName}
                        />
                        <Text style={[tailwind('text-gray-700 font-bold mb-1 mt-6')]}>
                            Group description
                            </Text>
                        <TextInput
                            placeholder="e.g the first group"
                            style={[tailwind('px-2 h-10 bg-gray-300 rounded-lg')]}
                            onChangeText={text => setGroupDescription(text)}
                            value={groupDescription}
                        />
                    </View>
                    <PrimaryButton
                        disabled={false} /* change to false to enable button */
                        style={[tailwind('mt-2')]}
                        title="Save Group"
                        onPress={() => createGroup()}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditGroupScreen;
