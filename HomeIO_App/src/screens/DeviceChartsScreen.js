import React, { useState, useEffect } from "react";
import { Text, SafeAreaView, ScrollView, View, Dimensions, Button, TouchableOpacity, StyleSheet, Alert, processColor } from "react-native";
import tailwind from 'tailwind-rn';
import Icon from 'react-native-ico-material-design';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from '../components/IconButton';
import styles from './Styles';
import GenericButton from '../components/GenericButton';
import { Picker } from '@react-native-picker/picker';
import { getUser, getJWT } from '../../auth';
const Environment = require('../../environments');

const DeviceChartsScreen = ({ route, navigation: { goBack }, navigation }) => {

    const deviceColors = { "bg-gray-700": '#4a5568', "bg-red-600": '#e53e3e', "bg-orange-600": '#dd6b20', "bg-yellow-600": '#d69e2e', "bg-green-600": '#38a169', "bg-teal-600": '#319795', "bg-blue-600": '#3182ce', "bg-indigo-600": '#5a67d8', "bg-purple-600": '#805ad5', "bg-pink-600": '#d53f8c' };

    const errorAlert = (data) => {
        Alert.alert(
            "Υπήρξε κάποιο πρόβλημα.",
            JSON.stringify(data.message),
            [
                {
                    text: "Ok",
                    style: "cancel"
                }
            ],
            { cancelable: true }
        );
    }

    const [devices, setDevices] = useState([]);

    const [allDevices, setAllDevices] = useState([]);

    const [loading, setLoading] = useState(false);

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        console.log("--CHART DATA: ", JSON.stringify(chartData));
    }, [chartData]);

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        let jwt = await getJWT();
        let request = await fetch(Environment.HOST + '/devices/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            }
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    errorAlert(data);
                });
                return;
            }
            response.json().then(function (data) {
                setAllDevices(data);
            });
        }).catch((err) => {
            errorAlert(err);
        });
    }

    const fetchConsumption = async (deviceInstance) => {
        setLoading(true);
        let jwt = await getJWT();
        console.log('fetching consumption for device: ' + deviceInstance._id);
        let request = await fetch(Environment.HOST + '/consumptions/compact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            },
            body: JSON.stringify({ from: fromDate, to: toDate, device_instance_id: deviceInstance._id })
        }).then((response) => {
            if (response.status !== 200) {
                response.json().then(function (data) {
                    errorAlert(data);
                });
                return;
            }

            response.json().then(async (data) => { //add fetched data to state
                console.log(data);
                let seriesObj = {
                    device: deviceInstance.name,
                    data: [],
                    color: deviceColors[deviceInstance.color]
                }
                await data.map(async (consumption, index) => {
                    let consObj = {};
                    if ("hour" in consumption._id) {
                        let hour;
                        if (consumption._id.hour.toString().length == 1) {
                            hour = "0" + consumption._id.hour.toString();
                        } else {
                            hour = consumption._id.hour.toString();
                        }
                        let day;
                        if (consumption._id.day.toString().length == 1) {
                            day = "0" + consumption._id.day.toString();
                        } else {
                            day = consumption._id.day.toString();
                        }
                        let month;
                        if (consumption._id.month.toString().length == 1) {
                            month = "0" + consumption._id.month.toString();
                        } else {
                            month = consumption._id.month.toString();
                        }
                        consObj.x = hour + ":00 " + day + '/' + month;
                        consObj.y = (consumption.sum / consumption.count).toFixed(1);
                        consObj.sortIndex = parseInt("" + month + day + hour);
                    } else if ("day" in consumption._id) {
                        let day;
                        if (consumption._id.day.toString().length == 1) {
                            day = "0" + consumption._id.day.toString();
                        } else {
                            day = consumption._id.day.toString();
                        }
                        let month;
                        if (consumption._id.month.toString().length == 1) {
                            month = "0" + consumption._id.month.toString();
                        } else {
                            month = consumption._id.month.toString();
                        }
                        consObj.x = day + '/' + month + '/' + consumption._id.year;
                        consObj.y = (consumption.sum / consumption.count).toFixed(1);
                        consObj.sortIndex = parseInt("" + consumption._id.year + month + day);
                    } else if ("week" in consumption._id) {
                        let month;
                        if (consumption._id.month.toString().length == 1) {
                            month = "0" + consumption._id.month.toString();
                        } else {
                            month = consumption._id.month.toString();
                        }
                        consObj.x = consumption._id.week + 'η βδομάδα ' + month + '/' + consumption._id.year;
                        consObj.y = (consumption.sum / consumption.count).toFixed(1);
                        consObj.sortIndex = parseInt("" + consumption._id.year + month + consumption._id.week);
                    } else if ("month" in consumption._id) {
                        let month;
                        if (consumption._id.month.toString().length == 1) {
                            month = "0" + consumption._id.month.toString();
                        } else {
                            month = consumption._id.month.toString();
                        }
                        consObj.x = month + '/' + consumption._id.year;
                        consObj.y = (consumption.sum / consumption.count).toFixed(1);
                        consObj.sortIndex = parseInt("" + consumption._id.year + month);
                    } else {
                        consObj.x = consumption._id.year;
                        consObj.y = (consumption.sum / consumption.count).toFixed(1);
                        consObj.sortIndex = parseInt("" + consumption._id.year);
                    }

                    seriesObj.data.push(consObj);
                });
                if (seriesObj.data.length > 0) { //ensure not to throw exception if there is no data
                    console.log("ADDING: ", seriesObj);
                    setChartData(prevState => [...prevState, seriesObj]);
                }
                setLoading(false);
            });
        }).catch((err) => {
            errorAlert(err);
            setLoading(false);
        });
    }

    const [type, setType] = useState('bar');

    const [line, setLine] = useState([]);

    const [bar, setBar] = useState([]);

    const [showChart, setShowChart] = useState(true);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [showFrom, setShowFrom] = useState(false);
    const [showTo, setShowTo] = useState(false);

    const onChangeFrom = (event, selectedDate) => {
        setShowFrom(Platform.OS === 'ios');
        const currentDate = selectedDate || fromDate;
        setFromDate(currentDate);
        setChartData([]);
        if (devices.length > 0) {
            devices.map((device, index) => {
                fetchConsumption(device);
            });
        }
    };

    const onChangeTo = (event, selectedDate) => {
        setShowTo(Platform.OS === 'ios');
        const currentDate = selectedDate || toDate;
        setToDate(currentDate);
        setChartData([]);
        if (devices.length > 0) {
            devices.map((device, index) => {
                fetchConsumption(device);
            });
        }
    };


    const removeDeviceFromChart = (device) => {
        setDevices(devices.filter(item => item.name !== device.name))
        setChartData(chartData.filter(item => item["device"] !== device.name));
    }

    return (
        <SafeAreaView style={[tailwind('bg-gray-900'), styles.safe]}>
            <View style={[tailwind('px-6 mt-3 flex flex-row justify-between')]}>
                <IconButton
                    color="white"
                    icon="go-back-left-arrow"
                    height="23"
                    width="23"
                    onPress={() => goBack()}
                />
            </View>
            <View style={[tailwind('mx-4 px-2 bg-gray-100 mt-6'), styles.safe, styles.roundedXl]}>
                <Text style={[tailwind('px-4 text-sm text-gray-500 mt-6 font-bold')]}>
                    δημιουργία γραφημάτων
                </Text>
                <View style={[tailwind('flex flex-row justify-between px-4')]}>
                    <Text style={[tailwind('text-gray-800 text-2xl font-bold')]}>
                        Γραφήματα
                    </Text>
                </View>
                <ScrollView style={[tailwind('mt-6 mb-6'), styles.safe]}>
                    <View style={tailwind('flex flex-row justify-around mb-4')}>
                        <TouchableOpacity style={[tailwind('w-1/2 flex flex-row')]}
                            onPress={() => setShowFrom(true)}
                        >
                            <View style={[tailwind('bg-gray-800 p-2 rounded-l ')]}>
                                <Text style={[tailwind('text-white')]}>Από</Text>
                            </View>
                            <View style={[tailwind('bg-gray-300 p-2 rounded-r w-full')]}>
                                <Text>{fromDate.getDate() + '/' + (fromDate.getMonth() + 1) + '/' + fromDate.getFullYear()}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[tailwind('w-1/2 flex flex-row')]}
                            onPress={() => setShowTo(true)}
                        >
                            <View style={[tailwind('bg-gray-800 p-2 rounded-l')]}>
                                <Text style={[tailwind('text-white')]}>Ως</Text>
                            </View>
                            <View style={[tailwind('bg-gray-300 p-2 rounded-r w-full')]}>
                                <Text>{toDate.getDate() + '/' + (toDate.getMonth() + 1) + '/' + toDate.getFullYear()}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {showFrom && (
                        <DateTimePicker
                            value={fromDate}
                            mode={mode}
                            is24Hour={true}
                            display="spinner"
                            onChange={onChangeFrom}
                        />
                    )}

                    {showTo && (
                        <DateTimePicker
                            value={toDate}
                            mode={mode}
                            is24Hour={true}
                            display="spinner"
                            onChange={onChangeTo}
                        />
                    )}
                    <Picker
                        //mode="dropdown"
                        selectedValue={null}
                        style={[tailwind('h-10 bg-gray-300 mx-2 mt-2')]}
                        onValueChange={async (itemValue, itemIndex) => {
                            if (!devices.some(device => device._id === itemValue._id)) {
                                setDevices(devices => [...devices, itemValue]);
                                await fetchConsumption(itemValue);
                            } else {
                                errorAlert({ message: 'Η συσκεύη έχει ήδη επιλεχθεί.' });
                            }
                        }}>
                        <Picker.Item label="Πατήστε & επιλέξτε συσκεύες" value="none" />
                        {
                            allDevices.map(function (device, index) {
                                return <Picker.Item key={index} label={device.name} value={device} />
                            })
                        }
                    </Picker>
                    <View style={[tailwind('flex-row justify-start flex-wrap mt-2')]}>
                        {
                            devices.map((device, index) => {
                                return <View style={[tailwind('mt-2 flex-row bg-gray-800 justify-between items-center py-2 px-3 rounded-full ml-2')]} key={index}>
                                    <Text style={[tailwind('text-white text-sm')]}>{device.name}</Text>
                                    <TouchableOpacity
                                        onPress={() => removeDeviceFromChart(device)}
                                    >
                                        <View style={[tailwind('ml-3 bg-gray-200 rounded-full p-1')]}>
                                            <Icon
                                                name="close-button"
                                                color="#374151"
                                                width="15"
                                                height="15"
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            })
                        }
                    </View>
                    <View style={[tailwind('')]}>
                        <View style={[tailwind('mt-4')]}>
                            <GenericButton
                                onPress={() => navigation.navigate('ChartsWebview', { data: chartData })}
                                height="18"
                                width="18"
                                icon="poll-symbol-on-black-square-with-rounded-corners"
                                title="Προβολή Γραφημάτων"
                                loading={loading}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default DeviceChartsScreen;
