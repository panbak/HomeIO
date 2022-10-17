import React, { useState } from "react";
import { Text, View } from "react-native";
import tailwind from 'tailwind-rn';
import IconButton from './IconButton';

const InviteCard = (props) => {
    return (
        <View style={[tailwind('w-full mb-2 p-4 flex bg-gray-900 rounded')]}>
            <View style={[tailwind('flex flex-row justify-center mb-2')]}>
                <Text style={[tailwind('text-white text-lg font-bold')]} >{props.name}</Text>
            </View>
            { (props.mode != 'sent') ?
                <>
                    <View style={[tailwind('flex flex-row justify-center mb-10')]}>
                        <Text style={[tailwind('text-gray-500')]} >from: {props.email}</Text>
                    </View>
                    <View style={[tailwind('flex flex-row justify-around')]}>
                        <IconButton
                            color="white"
                            icon="check-symbol"
                            height="25"
                            width="25"
                            onPress={props.onAccept}
                        />
                        <IconButton
                            color="white"
                            icon="rubbish-bin-delete-button"
                            height="25"
                            width="25"
                            onPress={props.onReject}
                        />
                    </View>
                </>
                :
                <>
                    <View style={[tailwind('flex flex-row justify-center mb-10')]}>
                        <Text style={[tailwind('text-gray-500')]} >to: {props.email}</Text>
                    </View>
                    <View style={[tailwind('flex flex-row justify-around')]}>
                        <IconButton
                            color="white"
                            icon="clear-button"
                            height="25"
                            width="25"
                            onPress={props.onCancel}
                        />
                    </View>
                </>
            }
        </View>
    );
};

export default InviteCard;
