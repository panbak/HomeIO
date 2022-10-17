import React, { useEffect, useState } from "react";
import { Switch, Text, StyleSheet, View, TouchableOpacity } from "react-native";
import tailwind from 'tailwind-rn';
import Icon from 'react-native-ico-material-design';

const DeviceCard = (props) => {
    const [isEnabled, setIsEnabled] = useState(props.isEnabled);

    const toggleSwitch = () => {
        setIsEnabled(props.onToggle());
    }

    return (
        <View opacity={!props.online ? 0.6 : 1} style={[tailwind(`${props.color} w-5/12 mb-8 px-3 py-4 items-center flex rounded-2xl`)]}>
            <TouchableOpacity
                style={[tailwind(`items-center flex`)]}
                onPress={props.onPress}
            >
                <Icon color="white"
                    name={props.icon}
                    height="30" width="30"
                    style={[tailwind('mt-2')]}
                />
                <Text style={[tailwind('text-white text-lg my-4 text-center')]}>{props.name}</Text>
            </TouchableOpacity>
            <Switch
                trackColor={{ false: "#fff", true: "#68d391" }}
                thumbColor={"#1a202c"}
                ios_backgroundColor="#fff"
                style={[tailwind('mb-2'), { transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }]}
                onValueChange={toggleSwitch}
                value={isEnabled}
            />
        </View>
    );
};


export default DeviceCard;
