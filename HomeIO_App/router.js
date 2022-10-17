import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthenticationScreen from './src/screens/AuthenticationScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AddDeviceScreen from './src/screens/AddDeviceScreen';
import EditDeviceScreen from './src/screens/EditDeviceScreen';
import UserSettingsScreen from './src/screens/UserSettingsScreen';
import DeviceScreen from './src/screens/DeviceScreen';
import DeviceChartsScreen from './src/screens/DeviceChartsScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import AddGroupScreen from './src/screens/AddGroupScreen';
import EditGroupScreen from './src/screens/EditGroupScreen';
import ShareDeviceScreen from './src/screens/ShareDeviceScreen';
import ShareInvitesScreen from './src/screens/ShareInvitesScreen';
import SelectBluetoothDeviceScreen from './src/screens/SelectBluetoothDeviceScreen';
import ChartsWebviewScreen from './src/screens/ChartsWebviewScreen';
import UpdateDeviceWifiCredentialsScreen from './src/screens/UpdateDeviceWifiCredentialsScreen';

import { ContextWrapper } from './AppContext';

export const LoggedInRoutes = (props) => {
    const LoggedInStack = createStackNavigator();

    return (
        <ContextWrapper jwtToken={props.jwtToken}>
            <NavigationContainer>
                <LoggedInStack.Navigator
                    screenOptions={{
                        headerShown: false
                    }}>
                    <LoggedInStack.Screen name="Dashboard" component={DashboardScreen} initialParams={{ runAuthCheck: props.runAuthCheck }} />
                    <LoggedInStack.Screen name="AddDevice" component={AddDeviceScreen} />
                    <LoggedInStack.Screen name="AddGroup" component={AddGroupScreen} />
                    <LoggedInStack.Screen name="EditGroup" component={EditGroupScreen} />
                    <LoggedInStack.Screen name="EditDevice" component={EditDeviceScreen} />
                    <LoggedInStack.Screen name="UserSettings" component={UserSettingsScreen} initialParams={{ runAuthCheck: props.runAuthCheck }} />
                    <LoggedInStack.Screen name="ShareDevice" component={ShareDeviceScreen} />
                    <LoggedInStack.Screen name="ShareInvites" component={ShareInvitesScreen} />
                    <LoggedInStack.Screen name="Device" component={DeviceScreen} />
                    <LoggedInStack.Screen name="DeviceCharts" component={DeviceChartsScreen} />
                    <LoggedInStack.Screen name="Groups" component={GroupsScreen} />
                    <LoggedInStack.Screen name="SelectBluetoothDevice" component={SelectBluetoothDeviceScreen} />
                    <LoggedInStack.Screen name="UpdateDeviceWifiCredentials" component={UpdateDeviceWifiCredentialsScreen} />
                    <LoggedInStack.Screen name="ChartsWebview" component={ChartsWebviewScreen} />
                </LoggedInStack.Navigator>
            </NavigationContainer>
        </ContextWrapper>
    );
}

export const LoggedOutRoutes = (props) => {
    const LoggedOutStack = createStackNavigator();

    return (
        <ContextWrapper>
            <NavigationContainer>
                <LoggedOutStack.Navigator
                    screenOptions={{
                        headerShown: false
                    }}>
                    <LoggedOutStack.Screen name="SignIn" component={AuthenticationScreen} initialParams={{ runAuthCheck: props.runAuthCheck }} />
                    <LoggedOutStack.Screen name="Register" component={RegistrationScreen} />
                </LoggedOutStack.Navigator>
            </NavigationContainer>
        </ContextWrapper>
    );
}