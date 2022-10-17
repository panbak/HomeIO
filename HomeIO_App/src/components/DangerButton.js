import React from "react";
import { Text, StyleSheet, View, Button, TouchableOpacity, Image } from "react-native";
import tailwind from 'tailwind-rn';

const DangerButton = (props) => {
    return (
        <View>
            <TouchableOpacity
                disabled={props.disabled}
                style={[tailwind(`p-4 mt-2 ${props.disabled ? 'bg-red-400' : 'bg-red-600'} rounded-lg`)]}
                onPress={props.onPress}>
                <Text style={[tailwind('text-white text-lg font-bold text-center')]}>{`${props.title}`}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({});

export default DangerButton;
