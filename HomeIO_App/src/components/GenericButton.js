import React from "react";
import { Text, StyleSheet, View, Button, TouchableOpacity, Image } from "react-native";
import tailwind from 'tailwind-rn';
import Icon from 'react-native-ico-material-design';

const GenericButton = (props) => {
    const { loading = false } = props;
    return (
        <View style={[tailwind('w-full')]}>
            <TouchableOpacity
                style={[tailwind(`p-3 w-3/5 ${!loading ? 'bg-gray-900' : 'bg-gray-300'} rounded-lg flex flex-row flex-wrap justify-around`)]}
                onPress={props.onPress} disabled={loading}>
                <Icon
                    color="white"
                    name={props.icon}
                    height={props.height}
                    width={props.width}
                />
                <Text style={[tailwind('text-white ml-1 font-bold text-center')]}>{`${props.title}`}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default GenericButton;
