import request from '../../shared/lib/request'

function getProfile() {
  return request({
    url:    `/auth/me`,
    method: 'GET'
  });
}

function login({username, password}) {
  return request({
    url:    '/auth/signin',
    method: 'POST',
    data:   {
      username,
      password
    }
  });
}

function registerUser({username, email, password, passwordConfirm}) {
  return request({
    url:    '/auth/signin',
    method: 'POST',
    data:   {
      username,
      email,
      password,
      passwordConfirm
    }
  });
}

function logout(body) {
  return request({
    url:    '/auth/logout',
    data: {id: body.id, username: body.username},
    method: 'POST'
  });
}

function changePassword(values) {
  return request({
    url:    '/auth/changePassword',
    data: {
      ...values
    },
    method: 'POST'
  });
}

function forget(values, type=1) {
  return request({
    url:    '/auth/forget',
    data: {
      ...values
    },
    method: 'POST'
  });
}


function updateMyInfo(data){
  return request({
    url:  '/rs/updateMyInfo',
    data: {...data},
    method: 'POST'
  })
}

const AuthService = {
  registerUser,
  getProfile,
  login,
  logout,
  changePassword,
  forget,
  updateMyInfo,

  //, update, delete, etc. ...
}

export default AuthService;
