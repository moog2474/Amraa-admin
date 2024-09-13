import React ,{useState, useContext} from 'react';
import {useHistory} from 'react-router-dom';
import AuthService from '../services/api/auth'
import {UserContext} from './UserContext';

export default function useAuth() {
  let history = useHistory();
  const {setUser} = useContext(UserContext);
  const [error, setError] = useState(null);
  //set user
  const setUserContext = async () => {
    AuthService.getProfile().then(res => {
      setUser(res.data);
      //history.push('/home');
      history.push({pathname: "/home", state: {termCondition: 1}})
    }).catch(e => {
      setError(e.response.data);
    })
  }

  //register user
  const registerUser = async (data) => {
    const {username, email, password, passwordConfirm} = data;
    AuthService.registerUser({
      username,
      email,
      password,
      passwordConfirm
    })
      .then(async () => {
        await setUserContext();
      });
  };
  //login user
  const loginUser = async (data) => {
    const {username, password} = data;
    try {
      let res = await AuthService.login({username, password});
      localStorage.setItem("token", res.data.token);
      await setUserContext();
      return true;
    } catch (e) {
      return e.response.data.message
    }
  };

  return {
    registerUser,
    loginUser,
    error,
  }
}
