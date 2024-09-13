import axios from 'axios'
//export const urlServer = "https://nis.crc.gov.mn";

export const urlServer = "http://localhost:3002";

/**
 * Create an Axios Client with defaults
 */
const client = axios.create({
  baseURL: `${urlServer}/api`
});

client.defaults.headers.post['Accept'] = 'application/json';

client.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token');
  config.headers.Authorization =  token ? `Bearer ${token}` : '';
  return config;
});

const responseSuccessHandler = response => {
  // console.log(response);
  return response.data;
};

const responseErrorHandler = error => {
  if (!error.response) {
    alert('NETWORK ERROR')
  } else {
      const code = error.response.status
      if (code === 401 && window.location.pathname !== '/login') {

        window.location.href = "/login";
      }

      return Promise.reject(error)
    }
}

client.interceptors.response.use(
  response => responseSuccessHandler(response),
  error => responseErrorHandler(error)
);

export default client;
