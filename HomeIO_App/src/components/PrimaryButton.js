import React from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import tailwind from 'tailwind-rn';

const PrimaryButton = (props) => {
    return (
        <View>
            <TouchableOpacity
                disabled={props.disabled}
                style={[tailwind(`p-4 ${props.disabled ? 'bg-indigo-300' : 'bg-indigo-600'} rounded-lg`)]}
                onPress={props.onPress}>
                <Text style={[tailwind('text-white text-lg font-bold text-center')]}>{`${props.title}`}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({});

export default PrimaryButton;
