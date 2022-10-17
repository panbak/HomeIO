import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';

const Users = () => {
    const [showPanel, setShowPanel] = useState(false);
    const [user, setUser] = useState({});
    const [instances, setInstances] = useState(0);
    const [users, setUsers] = useState([]);
    const config = require('../config');
    const openPanel = (position) => {
        setShowPanel(true);
        document.querySelector('#overlay').classList.remove('hidden');
        setUser(users[position]);
    }

    const closePanel = () => {
        setShowPanel(false);
        document.querySelector('#overlay').classList.add('hidden');
    }
    let jwt = JSON.parse(window.localStorage.getItem('user')).jwt;
    const fetchUsers = async () => {
        axios.get(`${config.SERVER_BASE_URL}/admin/users/`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            }
        }).then(res => {
            console.log(res.data);
            setUsers(res.data);
        }).catch(function (error) {
            console.log(error);
        });
    }

    const fetchUser = async (userId) => {
        axios.get(`${config.SERVER_BASE_URL}/admin/user/${userId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            }
        }).then(res => {
            setInstances(res.data.instances);
        }).catch(function (error) {
            console.log(error);
        });
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="mt-5">
            {
                users.map((user, index) => {
                    return (
                        <div className="bg-white rounded shadow-md lg:border-l-8 border-white text-center hover:shadow-lg my-3" key={index}>

                            <div className="grid grid-cols-1 lg:grid-cols-3">
                                <div className="bg-custom-blue p-3">
                                    <span className="font-bold text-lg">{user.email}</span>
                                </div>
                                <div className="p-3">
                                    <span className="font-bold text-md">{user.active ? 'Ενεργός' : 'Ανενεργός'} </span>
                                </div>
                                <div className="p-3">
                                    <button className="rounded bg-custom-blue px-3 py-1 font-bold shadow hover:shadow-md" onClick={() => openPanel(index)}>Λεπτομέρειες</button>
                                </div>
                            </div>

                        </div>
                    );
                })
            }
            <aside
                className={`transform top-0 right-0 w-full md:w-3/5 lg:w-2/5 shadow-2xl bg-white fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30 ${showPanel ? '-translate-x-0' : 'translate-x-full'}`}
            >
                <div className="p-8">
                    <button className="bg-gray-200 py-2 px-6 rounded" id="close-order-panel" onClick={() => closePanel()}><i
                        className="fas fa-times"></i></button>
                    <main className="text-center">
                        <span className="text-xl font-bold">{user.email}</span>
                        <table className="table-auto mx-auto mt-10">
                            <tbody>
                                <tr>
                                    <td className="border px-4 py-2 font-bold">Τελευταία σύνδεση</td>
                                    <td className="border px-4 py-2">{new Date(user.last_login).toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <td className="border px-4 py-2 font-bold">Επικυρωμένος</td>
                                    <td className="border px-4 py-2">{user.verified ? 'Ναι' : 'Όχι'}</td>
                                </tr>
                                <tr>
                                    <td className="border px-4 py-2 font-bold">Λογαριασμός ενεργός</td>
                                    <td className="border px-4 py-2">{user.active ? 'Ναι' : 'Όχι'}</td>
                                </tr>
                            </tbody>
                        </table>
                        {!user.active ? <div className="bg-green-400 font-bold p-2 rounded w-2/5 mx-auto mt-4 shadow hover:shadow-md cursor-pointer" onClick={() => console.log('deactivate')}>Ενεργοποίηση</div> : <div className="bg-red-400 font-bold p-2 rounded w-2/5 mx-auto mt-4 hover:shadow-md cursor-pointer" onClick={() => console.log('activate')}>Απενεργοποίηση</div>}
                        {/* <Link to={`/stats/${user.email}`} onClick={closePanel}><div className="bg-gray-600 font-bold p-2 rounded w-2/5 mx-auto mt-4 hover:shadow-md cursor-pointer text-white" onClick={() => console.log('activate')}><i className="fas fa-chart-line"></i> Στατιστικά </div></Link> */}

                    </main>
                </div>
            </aside>
        </div>
    );
}

export default Users;