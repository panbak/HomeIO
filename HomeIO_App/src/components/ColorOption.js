import React, { useState } from "react";
import { Text, StyleSheet, View, Button, TouchableOpacity, Image } from "react-native";
import tailwind from 'tailwind-rn';
import Icon from 'react-native-ico-material-design';

const ColorOption = (props) => {

    return (
        <View>
            <TouchableOpacity
                style={[tailwind(`rounded ${props.color} h-12 w-12 m-1 flex justify-around items-center`), styles.shadow]}
                onPress={props.onPress}
            >
                {props.selected ?
                    <Icon
                        name="verification-mark"
                        color="white"
                    />
                    : <Text></Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 3,
    },
    selectedBg: {
        backgroundColor: "black"
    }
});

export default ColorOption;
