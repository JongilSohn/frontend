import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React from 'react';
import Login from './Pages/Login/Login';
import Signup from './Pages/Signup/Signup';
import Main from './Pages/Main/Main';
import ProductManagement from './Pages/Product/ProductManagement';
import Home from './Pages/Home/Home';
import Order from './Pages/Order/Order';
import User from './Pages/User/User';
import UserDetail from './Pages/User/UserDetail';

function Routes() {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={Login} />
        <Route exact path='/signup' component={Signup} />
        <Route exact path='/main' component={Main} />
        <Route exact path='/home' component={Home} />
        <Route exact path='/order/:id' component={Order} />
        {/* <Route exact path='/account/seller' component={User} /> */}
        <Route exact path='/account/sellerList' component={User} />
        <Route exact path='/product' component={ProductManagement} />
        <Route exact path='/userdetail' componenet={UserDetail} />
      </Switch>
    </Router>
  );
}
export default Routes;
