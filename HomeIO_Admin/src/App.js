import React, { useEffect } from 'react';
import { NavLink, Link, Route, Switch, useLocation, useHistory } from "react-router-dom";
import Account from './screens/Account';
import Dashboard from './screens/Dashboard';
import Logs from './screens/Logs';
import Users from './screens/Users';
import Stats from './screens/Stats';
import './App.css';

const App = () => {
  let history = useHistory();
  let location = useLocation();
  useEffect(() => {
    //menu event listeners
    const opener = document.getElementById('open-menu');
    const menu = document.getElementById('menu');

    opener.addEventListener('click', function () {
      if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
      } else {
        menu.classList.add('hidden');
      }
    });
  });

  const logout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  }

  return (
    <div className="pt-16 px-10 grid lg:grid-cols-5 pb-20">
      <div className="bg-black opacity-50 z-20 top-0 bottom-0 left-0 right-0 fixed hidden" id="overlay">
      </div>
      <div className="lg:col-span-1">
        <nav>
          <div className="flex justify-between mb-6 px-2 md:mb-16">
            <h1 className="font-bold">
              <Link to="/" className="text-xl text-gray-800"><i className="fas fa-user-shield mr-2"></i>Admin <span
                className="text-blue-400">HomeIO</span></Link>
            </h1>
            <div className="px-4 cursor-pointer lg:hidden" id="open-menu">
              <i className="fas fa-bars"></i>
            </div>
          </div>
          <ul className="hidden lg:block mr-10 mb-10" id="menu">
            <li className="my-3">
              <NavLink className="menu-item" to="/dashboard" activeClassName="selected">
                <i className="fas fa-chart-bar mr-2"></i>
                <span>Αρχική</span>
              </NavLink>
            </li>
            <li className="my-3">
              <NavLink className="menu-item" to="/users" activeClassName="selected">
                <i className="fas fa-users mr-2"></i>
                <span>Χρήστες</span>
              </NavLink>
            </li>
            <div className="mt-16">
              <span className="px-3 text-gray-500">Άλλα</span>
              <li className="my-3">
                <NavLink className="menu-item" to="/logs" activeClassName="selected">
                  <i className="fas fa-redo-alt mr-2"></i>
                  <span>Συμβάντα</span>
                </NavLink>
              </li>
              <li className="my-3">
                <NavLink className="menu-item" to="/account" activeClassName="selected">
                  <i className="fas fa-user-alt mr-2"></i>
                  <span>Λογαριασμός</span>
                </NavLink>
              </li>
            </div>
          </ul>
        </nav>
      </div>
      <div className="lg:col-span-4">
        <div className="flex justify-center md:justify-end">
          <div onClick={history.goBack} className="rounded bg-gray-200 py-2 px-6 mr-auto"><i
            className="fas fa-long-arrow-alt-left"></i></div>
          {/* <button className="font-bold rounded-full bg-white mr-2 py-2 px-3 shadow sm:block hidden cart"><i
            className="fas fa-shopping-basket"></i> 8 items - $17.50</button> */}
          {/* <Link href="#" className="font-bold rounded-full bg-blue-400 ml-2 py-2 px-3 text-gray-800">Log out</Link> */}
          <span onClick={logout} className="rounded font-bold bg-gray-300 py-2 px-3 ml-2 text-gray-800 cursor-pointer">Sign out <i className="fas fa-sign-out-alt"></i></span>
        </div>
        {/* <button className="font-bold rounded-full bg-white mr-2 py-2 px-3 shadow block sm:hidden mt-5 w-full cart"><i
          className="fas fa-shopping-basket mr-3"></i> 8 items - $17.50</button> */}
        <div className="mt-16 bg-gray-800 rounded p-4">
          <div><span className="text-lg md:text-xl text-blue-400"><span className="text-gray-300">/admin</span>{location.pathname}</span></div>
          <hr className="mt-2" />
          <Switch>
            <Route exact path="/"><Dashboard /></Route>
            <Route path="/dashboard"><Dashboard /></Route>
            <Route path="/users"><Users /></Route>
            <Route path="/logs"><Logs /></Route>
            <Route path="/account"><Account /></Route>
            <Route path="/stats/:userId"><Stats /></Route>
            <Route path="*"><div className="text-white text-lg">404 - Η σελίδα δεν βρέθηκε</div></Route>
          </Switch>

        </div>
      </div>
    </div>
  );
}

export default App;
