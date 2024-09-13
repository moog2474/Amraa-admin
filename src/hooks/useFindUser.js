import {useState, useEffect} from 'react';
import AuthService from "../services/api/auth";

export default function useFindUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function findUser() {
      return AuthService.getProfile()
        .then(res => {
          setUser(res.data);
          setLoading(false);
        }).catch(e => {
          setLoading(false);
        });
    }

    findUser();
  }, []);

  return {
    user,
    setUser,
    isLoading
  }
}