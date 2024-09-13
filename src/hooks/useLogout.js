import {useHistory} from 'react-router-dom';
import {useContext} from "react";
import {UserContext} from "./UserContext";
import AuthService from "../services/api/auth";

export default function useLogout(id) {
  const {setUser} = useContext(UserContext);
  let history = useHistory();

  const logoutUser = async (user) => {
    try {
      await AuthService.logout(user).then(res => {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("goToken");
        history.push('/');
      })
    } catch (err) {
      console.log(err);
    }
  }

  return {
    logoutUser
  }

}
