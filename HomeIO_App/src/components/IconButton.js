import React from "react";
import { Text, StyleSheet, View, Button, TouchableOpacity, Image } from "react-native";
import tailwind from 'tailwind-rn';
import Icon from 'react-native-ico-material-design';

const IconButton = (props) => {
    return (
        <View>
            <TouchableOpacity
                onPress={props.onPress}>
                <Icon
                    color={props.color}
                    name={props.icon}
                    height={props.height}
                    width={props.width}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({});

export default IconButton;
