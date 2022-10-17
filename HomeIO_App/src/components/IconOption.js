import React, { useState } from "react";
import { Text, StyleSheet, View, Button, TouchableOpacity, Image } from "react-native";
import tailwind from 'tailwind-rn';
import Icon from 'react-native-ico-material-design';

const IconOption = (props) => {

    return (
        <View>
            <TouchableOpacity
                style={[tailwind(`rounded ${props.selected ? "bg-black" : "bg-white"} p-4 m-1`), styles.shadow]}
                onPress={props.onPress}
            >
                <Icon
                    color={props.selected ? "white" : props.color}
                    name={props.icon}
                    height="20"
                    width="20"
                />
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

export default IconOption;
