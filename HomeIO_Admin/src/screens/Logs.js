import React, { useState, useEffect } from 'react';
import axios from 'axios';
function Logs() {
    const [logs, setLogs] = useState([]);

    const config = require('../config');

    useEffect(() => {
        fetchLogs();
    }, []);
    let jwt = JSON.parse(window.localStorage.getItem('user')).jwt;
    const fetchLogs = async (userId) => {
        axios.get(`${config.SERVER_BASE_URL}/admin/logs`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            }
        }).then(res => {
            setLogs(res.data);
        }).catch(function (error) {
            console.log(error);
        });
    }
    return (
        <div className="mt-5">
            <div className="bg-white rounded shadow-md lg:border-l-8 border-white text-center hover:shadow-lg my-3">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-gray-900 p-3 col-span-1">
                        <span className="font-bold text-white text-lg">Περιγραφή</span>
                    </div>
                    <div className="p-3 col-span-1">
                        <span className="font-bold text-md">Συσκεύη</span>
                    </div>
                    <div className="bg-gray-900 p-3 col-span-1">
                        <span className="font-bold text-white text-md">Χρήστης</span>
                    </div>
                    <div className="p-3 col-span-1">
                        <span className="font-bold text-md">Ημ/νία</span>
                    </div>
                </div>

            </div>
            {
                logs.map((log, index) => {
                    return (
                        <div className="bg-white rounded shadow-md lg:border-l-8 border-white text-center hover:shadow-lg my-3" key={index}>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                                <div className="bg-custom-blue p-3 col-span-1">
                                    <span className="font-bold text-lg">{log.description}</span>
                                </div>
                                <div className="p-3 col-span-1">
                                    <span className="font-bold text-md">{log.device_id ? log.device_id.device_code : null}</span>
                                </div>
                                <div className="p-3 col-span-1">
                                    <span className="font-bold text-md">{log.user_id ? log.user_id.email : null}</span>
                                </div>
                                <div className="p-3 col-span-1">
                                    <span className="font-bold text-md">{new Date(log.date).toLocaleString()}</span>
                                </div>
                            </div>

                        </div>
                    );
                })
            }
        </div>
    );
}

export default Logs;
