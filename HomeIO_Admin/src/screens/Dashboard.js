import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [userCount, setUserCount] = useState(0);
    const [deviceCount, setDeviceCount] = useState(0);
    const [instanceCount, setInstanceCount] = useState(0);

    const fetchUserCount = () => {
        axios.get(`https://home-io-server.herokuapp.com/admin/users/count`).then(res => {
            setUserCount(res.data);
        }).catch(function (error) {
            console.log(error);
        });
    }

    const fetchDeviceCount = () => {
        axios.get(`https://home-io-server.herokuapp.com/admin/devices/count`).then(res => {
            setDeviceCount(res.data);
        }).catch(function (error) {
            console.log(error);
        });
    }

    const fetchInstancesCount = () => {
        axios.get(`https://home-io-server.herokuapp.com/admin/instances/count`).then(res => {
            setInstanceCount(res.data);
        }).catch(function (error) {
            console.log(error);
        });
    }

    useEffect(() => {
        fetchUserCount();
        fetchDeviceCount();
        fetchInstancesCount();
    }, []);

    return (
        <div className="mt-6">
            <div className="flex flex-wrap flex-inline justify-around">
                <div className="bg-yellow-400 p-6 text-lg font-bold rounded">Σύνολο χρηστών: {userCount}</div>
                <div className="bg-indigo-400 p-6 text-lg font-bold rounded">Σύνολο συσκευών: {deviceCount}</div>
                <div className="bg-pink-400 p-6 text-lg font-bold rounded">Σύνολο παραλλαγών συσκευών: {instanceCount}</div>
            </div>
        </div>
    );
}

export default Dashboard;