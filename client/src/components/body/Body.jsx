// import lib
import React, {useEffect, useState} from "react";
import { Switch, Route} from "react-router-dom";
import NotFound from "../utils/NotFound/NotFound";
import { useSelector } from "react-redux";
import axios from 'axios';
// import auth
import ActivationEmail from "./auth/ActivationEmail";
import Register from "./auth/Register";
import Login from "./auth/Login";
// Import body
import ForgotPass from "../body/auth/ForgotPassword";
import ResetPass from "../body/auth/ResetPassword";
import Profile from "../body/profile/Profile";
import EditUser from "../body/profile/EditUser";

import ChatHome from "./chatHome/chatHome";
import Home from "./home/Home";

import "./body.scss";

function Body() {
  const auth = useSelector((state) => state.auth);
  
  const [isLogged, setIsLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // const { isLogged, isAdmin } = auth;

  useEffect(() => {
    setIsLogged(auth.isLogged);
    setIsAdmin(auth.isAdmin);
  }, [auth])

  return (
    <section>
      <Switch>
        <Route path={`/`} component={Home} exact />

        {/* <Route path={`/conversations`} component={isLogged ? HomeTest : Login}/> */}
        
        <Route path={`/conversations`} > {/* sida way */}
          {localStorage.getItem('firstLogin') ? <ChatHome/> : <Login/>} 
        </Route>
          
        <Route path={`/login`} component={isLogged ? NotFound : Login} exact />

        <Route
          path={`/register`}
          component={isLogged ? NotFound : Register}
          exact
        />

        <Route
          path={`/forgot_password`}
          component={isLogged ? NotFound : ForgotPass}
          exact
        />

        <Route
          path={`/user/reset/:token`}
          component={isLogged ? NotFound : ResetPass}
          exact
        />

        <Route
          path={`/user/activate/:activation_token`}
          component={ActivationEmail}
          exact
        />

        <Route
          path={`/profile`}
          component={isLogged ? Profile : NotFound}
          exact
        />
        <Route
          path={`/edit_user/:id`}
          component={isAdmin ? EditUser : NotFound}
          exact
        />
      </Switch>
    </section>
  );
}

export default Body;
