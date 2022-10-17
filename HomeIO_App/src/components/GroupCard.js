import React, { useState } from "react";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import tailwind from 'tailwind-rn';
import IconButton from './IconButton';

const GroupCard = (props) => {
    return (
        <View style={[tailwind('w-full mb-2 p-4 flex bg-gray-900 rounded')]}>
            <View style={[tailwind('flex flex-row justify-between')]}>
                <TouchableOpacity onPress={props.edit}>
                    <Text style={[tailwind('text-white text-lg font-bold')]} >{props.name}</Text>
                </TouchableOpacity>
                <IconButton
                    color="white"
                    icon="rubbish-bin-delete-button"
                    height="25"
                    width="25"
                    onPress={props.onPress}
                />
            </View>
            <Text style={[tailwind('text-gray-300 mt-4')]}>{props.description}</Text>
        </View>
    );
};

export default GroupCard;
