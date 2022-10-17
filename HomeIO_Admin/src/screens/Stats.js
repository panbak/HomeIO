import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';

const Stats = () => {

    const [user, setUser] = useState(false);

    const config = require('../config');

    let { userId } = useParams();

    useEffect(() => {
        fetchUser(userId);
    }, []);
    let jwt = JSON.parse(window.localStorage.getItem('user')).jwt;
    const fetchUser = async (userId) => {
        axios.get(`${config.SERVER_BASE_URL}/admin/user/${userId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            }
        }).then(res => {
            setUser(res.data);
        }).catch(function (error) {
            console.log(error);
        });
    }

    return (
        <div className="mt-6">
            {
                !user ?
                    '' :
                    <div className="flex flex-wrap flex-inline justify-around bg-white text-lg font-bold text-center">
                        <div className="p-6 border w-1/3">Συσκευές: <span className="text-blue-600">{user.instances}</span></div>
                        <div className="p-6 border w-1/3">Τελευταία σύνδεση: <span className="text-blue-600">{user.user.last_login}</span></div>
                        <div className="p-6 border w-1/3">Λογαριασμός ενεργός: {user.user.active === true ? <span className="text-green-600">Ναι</span> : <span className="text-red-600">Όχι</span>}</div>
                    </div>
            }
        </div>
    );
}

export default Stats;