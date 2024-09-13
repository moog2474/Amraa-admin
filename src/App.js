
import React, { useEffect, useState } from "react";
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.carmine.css';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import MainLayout from "./Layouts/MainLayout";
import { UserContext } from './hooks/UserContext';
import io from 'socket.io-client';
import useFindUser from './hooks/useFindUser';
import Login from './pages/Login';
import './App.css';
import PrivateRoute from './pages/PrivateRoute';
import UserLogs from "./pages/settings/UserLogs";
import TechnologyPlan from "./pages/technology/TechnologyPlan";
import TechnologyPerformance from "./pages/technology/TechnologyPerformance";
import RefMeasure from "./pages/settings/RefMeasure";
import User from './pages/settings/User';
import RoleMenu from './pages/settings/RoleMenu';
import CopperProduct from './pages/copper/CopperProduct';
import { CopperRegistration } from './pages/copper/CopperRegistration';
import { BathOperation } from './pages/operations/BathOperation';
import { Dashboard } from './pages/dashboard';
import Worker from './pages/settings/Worker';
import RefDepartment from './pages/settings/RefDepartment';
import RefPosition from './pages/settings/RefPosition';

function App() {
    const [socket, setSocket] = useState(null);
    const {
        user,
        setUser,
        isLoading
    } = useFindUser();

    useEffect(() => {
        setSocket(io('ws://localhost:3002'));
    }, []);

    useEffect(() => {
        if (user?.id) {
            socket?.emit('addUser', user?.id);
        }
    }, [socket]);

    return (
        <Router>
            <UserContext.Provider value={{ user, setUser, isLoading }}>
                <Switch>
                    <Route exact path="/">
                        {user ? <Redirect to="/home" /> : <Redirect to="/login" />}
                    </Route>
                    <Route path="/login" component={Login} />
                    <MainLayout socket={socket} >
                        <PrivateRoute path="/home" component={Dashboard} />
                        <PrivateRoute path="/userLogs" component={UserLogs} />
                        <PrivateRoute path="/bathOp" component={BathOperation} />
                        <PrivateRoute path="/refMeasure" component={RefMeasure} />
                        <PrivateRoute path="/technologyPlan" component={TechnologyPlan} />
                        <PrivateRoute path="/technologyPerformance" component={TechnologyPerformance} />
                        <PrivateRoute path="/user" component={User} />
                        <PrivateRoute path="/roleMenu" component={RoleMenu} />
                        <PrivateRoute path="/copperProduct" component={CopperProduct} />
                        <PrivateRoute path="/copperRegistration" component={CopperRegistration} />
                        <PrivateRoute path="/worker" component={Worker}/>
                        <PrivateRoute path="/department" component={RefDepartment}/>
                        <PrivateRoute path="/position" component={RefPosition}/>
                    </MainLayout>
                </Switch>
            </UserContext.Provider>
        </Router>
    );
}

export default App;
