import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import tailwind from 'tailwind-rn';

const SecondaryButton = (props) => {
    return (
        <View>
            <TouchableOpacity
                disabled={props.disabled}
                style={[tailwind(`px-5 py-3 ${props.disabled ? 'bg-gray-600' : 'bg-gray-800'} rounded-lg`)]}
                onPress={props.onPress}>
                <Text style={[tailwind('text-white font-bold text-center')]}>{`${props.title}`}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SecondaryButton;
